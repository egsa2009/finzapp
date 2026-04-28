import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IngestSmsDto } from './dto/ingest-sms.dto';
import { IngestPushDto } from './dto/ingest-push.dto';
import axios from 'axios';

@Injectable()
export class IngestService {
  constructor(private prisma: PrismaService) {}

  async processSms(userId: string, ingestSmsDto: IngestSmsDto) {
    const { raw_text, sender, received_at } = ingestSmsDto;

    // Call NLP service to parse SMS
    const nlpResult = await this.callNlpService(raw_text, sender, 'sms');

    if (!nlpResult) {
      throw new BadRequestException('Failed to parse SMS');
    }

    // NLP returns { parsed: { amount, merchant, type, transaction_at, bank, confidence } }
    const parsed = nlpResult.parsed ?? nlpResult;

    // Find applicable classification rules
    const applicableRule = await this.findApplicableRule(userId, raw_text);

    // Determine category
    let categoryId: string | null = null;
    if (applicableRule) {
      categoryId = applicableRule.category_id;
    }

    const transactionAt = parsed.transaction_at
      ? new Date(parsed.transaction_at)
      : new Date(received_at);

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        user_id: userId,
        category_id: categoryId,
        amount: (parsed.amount ?? 0).toString(),
        description: parsed.merchant || parsed.bank || 'Transacción bancaria',
        transaction_type: parsed.type === 'income' ? 'INCOME' : 'EXPENSE',
        transaction_source: 'SMS',
        merchant: parsed.merchant ?? null,
        transaction_at: transactionAt,
        raw_text,
        confirmed: !!categoryId,
      },
      include: { category: true },
    });

    return {
      transaction,
      confirmed: !!categoryId,
    };
  }

  async processPush(userId: string, ingestPushDto: IngestPushDto) {
    const { raw_text, app_package, received_at } = ingestPushDto;

    // Call NLP service to parse push notification
    const nlpResult = await this.callNlpService(raw_text, app_package, 'push');

    if (!nlpResult) {
      throw new BadRequestException('Failed to parse push notification');
    }

    const parsed = nlpResult.parsed ?? nlpResult;

    // Find applicable classification rules
    const applicableRule = await this.findApplicableRule(userId, raw_text);

    // Determine category
    let categoryId: string | null = null;
    if (applicableRule) {
      categoryId = applicableRule.category_id;
    }

    const transactionAt = parsed.transaction_at
      ? new Date(parsed.transaction_at)
      : new Date(received_at);

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        user_id: userId,
        category_id: categoryId,
        amount: (parsed.amount ?? 0).toString(),
        description: parsed.merchant || parsed.bank || app_package,
        transaction_type: parsed.type === 'income' ? 'INCOME' : 'EXPENSE',
        transaction_source: 'PUSH',
        merchant: parsed.merchant ?? null,
        transaction_at: transactionAt,
        raw_text,
        confirmed: !!categoryId,
      },
      include: { category: true },
    });

    return {
      transaction,
      confirmed: !!categoryId,
    };
  }

  private async callNlpService(raw_text: string, sender?: string, source: 'sms' | 'push' = 'sms') {
    try {
      const nlpServiceUrl = process.env.NLP_SERVICE_URL || 'http://nlp-service:8000';
      const response = await axios.post(`${nlpServiceUrl}/parse`, {
        raw_text,
        sender: sender ?? '',
        source,
      });

      return response.data;
    } catch (error) {
      console.error('NLP Service error:', error);
      return null;
    }
  }

  private async findApplicableRule(userId: string, raw_text: string) {
    const rules = await this.prisma.classificationRule.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(raw_text)) {
        return rule;
      }
    }

    return null;
  }
}
