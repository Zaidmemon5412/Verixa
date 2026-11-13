"""
Structured JSON log formatter for production observability (ELK, Datadog, Grafana Loki).
Equivalent to Winston JSON formatting in Node.js, using Python's standard library.
"""
import json
import logging
from datetime import datetime, timezone


class StructuredJsonFormatter(logging.Formatter):
    """
    Formats Python LogRecord instances into single-line JSON strings.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_Entry = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "process": record.process,
            "thread": record.thread,
            "message": record.getMessage(),
        }

        if record.exc_info:
            log_Entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_Entry, ensure_ascii=False)

