"""
Normalizador de datos extraídos de SMS y push bancarios.
Convierte strings de monto, comercio y fecha a formatos estándar.
"""

import re
from datetime import datetime
from dateutil import parser as date_parser
from typing import Optional


def normalize_amount(text: str) -> Optional[float]:
    """
    Convierte string de monto a float.
    Soporta formatos: "45.000", "45,000.00", "45000", "45.000,00", etc.

    Args:
        text: String con el monto a normalizar

    Returns:
        float con el monto normalizado o None si no se puede parsear
    """
    if not text or not isinstance(text, str):
        return None

    # Limpiar espacios
    text = text.strip()

    # Detectar si usa . o , como separador decimal
    # Heurística: el último separador es el decimal si va seguido de exactamente 2 dígitos
    # De lo contrario, ambos son separadores de miles

    dot_pos = text.rfind('.')
    comma_pos = text.rfind(',')

    # Caso 1: "45.000" o "45,000" (separador de miles, valor entero)
    if dot_pos > comma_pos and dot_pos >= 0:
        # Hay punto después de coma o sin coma
        if dot_pos == len(text) - 3:  # .XX al final (formato decimal)
            # "45,000.00" -> reemplazar coma por nada, punto queda
            text = text.replace(',', '')
        else:  # .XXX o más (formato miles)
            # "45.000" o "45.000.000" -> reemplazar puntos por nada
            text = text.replace('.', '')
            if comma_pos >= 0:
                text = text.replace(',', '.')
    elif comma_pos > dot_pos and comma_pos >= 0:
        # Hay coma después de punto o sin punto
        if comma_pos == len(text) - 3:  # ,XX al final (formato decimal)
            # "45.000,00" -> reemplazar punto por nada, coma por punto
            text = text.replace('.', '')
            text = text.replace(',', '.')
        else:  # ,XXX o más (formato miles)
            # "45,000" -> reemplazar comas por nada
            text = text.replace(',', '')

    # Remover caracteres no numéricos excepto punto decimal
    text = re.sub(r'[^\d.]', '', text)

    try:
        return float(text)
    except ValueError:
        return None


def normalize_merchant(text: str) -> Optional[str]:
    """
    Limpia y capitaliza nombre de comercio.
    Convierte "RAPPI*RESTAURANTE" -> "Rappi Restaurante"

    Args:
        text: String con nombre del comercio

    Returns:
        String normalizado o None si está vacío
    """
    if not text or not isinstance(text, str):
        return None

    # Limpiar espacios
    text = text.strip()

    if not text:
        return None

    # Remover asteriscos y reemplazarlos con espacios
    text = text.replace('*', ' ')
    text = text.replace('_', ' ')
    text = text.replace('-', ' ')

    # Remover números y caracteres especiales al inicio/final
    text = re.sub(r'^[\d\s#@]+', '', text)
    text = re.sub(r'[\d\s#@]+$', '', text)

    # Collapsar espacios múltiples
    text = re.sub(r'\s+', ' ', text).strip()

    if not text:
        return None

    # Convertir a Title Case (primera letra mayúscula por palabra)
    # Pero preservar acrónimos cortos como "ATM"
    words = text.split()
    result = []
    for word in words:
        if len(word) > 3 or word.isupper():
            result.append(word.capitalize())
        else:
            result.append(word.upper() if word.isupper() else word.capitalize())

    normalized = ' '.join(result)

    return normalized if normalized else None


def normalize_date(text: str, reference_date: Optional[datetime] = None) -> Optional[datetime]:
    """
    Parsea múltiples formatos de fecha colombianos.
    Soporta: dd/mm/yyyy, yyyy-mm-dd, "23 de abril de 2026", "23/04/2026 14:32", etc.

    Args:
        text: String con la fecha a parsear
        reference_date: Fecha de referencia para contexto (default: hoy)

    Returns:
        datetime parseado o None si no se puede
    """
    if not text or not isinstance(text, str):
        return None

    text = text.strip()

    if not text:
        return None

    if reference_date is None:
        reference_date = datetime.now()

    # Limpiar texto: remover acentos comunes en español
    text_clean = text.replace('á', 'a').replace('é', 'e').replace('í', 'i')
    text_clean = text_clean.replace('ó', 'o').replace('ú', 'u')

    # Diccionario de meses en español
    meses_es = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5,
        'junio': 6, 'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10,
        'noviembre': 11, 'diciembre': 12, 'ene': 1, 'feb': 2, 'mar': 3,
        'abr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'sep': 9,
        'oct': 10, 'nov': 11, 'dic': 12
    }

    # Detectar formato "23 de abril de 2026" o "23 de abril"
    pattern_es = r'(\d{1,2})\s+(?:de\s+)?(' + '|'.join(meses_es.keys()) + r')\s+(?:de\s+)?(\d{4})?'
    match = re.search(pattern_es, text_clean.lower())
    if match:
        day = int(match.group(1))
        month = meses_es[match.group(2)]
        year = int(match.group(3)) if match.group(3) else reference_date.year

        try:
            return datetime(year, month, day)
        except ValueError:
            pass

    # Intentar parsear con dateutil (maneja muchos formatos)
    try:
        # Especificar dayfirst=True para formatos dd/mm/yyyy
        parsed = date_parser.parse(text, dayfirst=True, default=reference_date)
        return parsed
    except (ValueError, TypeError):
        pass

    # Fallback: patrones específicos
    # Patrón dd/mm/yyyy o dd/mm/yy
    pattern_ddmmyy = r'(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})'
    match = re.search(pattern_ddmmyy, text)
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        year = int(match.group(3))

        # Si año es 2 dígitos, asumir 20XX
        if year < 100:
            year += 2000

        try:
            return datetime(year, month, day)
        except ValueError:
            pass

    # Patrón yyyy-mm-dd
    pattern_yyyymmdd = r'(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})'
    match = re.search(pattern_yyyymmdd, text)
    if match:
        year = int(match.group(1))
        month = int(match.group(2))
        day = int(match.group(3))

        try:
            return datetime(year, month, day)
        except ValueError:
            pass

    return None


def normalize_time(text: str, reference_date: Optional[datetime] = None) -> Optional[datetime]:
    """
    Extrae hora de un texto y combina con fecha de referencia.
    Soporta: "14:32", "14:32:00", "2:32 PM", etc.

    Args:
        text: String con la hora
        reference_date: datetime para combinar hora (default: hoy)

    Returns:
        datetime con hora combinada o None si no se puede
    """
    if not text or not isinstance(text, str):
        return None

    text = text.strip()

    if reference_date is None:
        reference_date = datetime.now()

    # Patrón HH:MM:SS o HH:MM
    pattern_time = r'(\d{1,2}):(\d{2})(?::(\d{2}))?'
    match = re.search(pattern_time, text)

    if match:
        hour = int(match.group(1))
        minute = int(match.group(2))
        second = int(match.group(3)) if match.group(3) else 0

        if 0 <= hour < 24 and 0 <= minute < 60 and 0 <= second < 60:
            try:
                return reference_date.replace(hour=hour, minute=minute, second=second)
            except ValueError:
                pass

    # Patrón AM/PM
    pattern_ampm = r'(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)'
    match = re.search(pattern_ampm, text)

    if match:
        hour = int(match.group(1))
        minute = int(match.group(2))
        ampm = match.group(3).upper()

        if ampm == 'PM' and hour != 12:
            hour += 12
        elif ampm == 'AM' and hour == 12:
            hour = 0

        if 0 <= hour < 24 and 0 <= minute < 60:
            try:
                return reference_date.replace(hour=hour, minute=minute, second=0)
            except ValueError:
                pass

    return None
