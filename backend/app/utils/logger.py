"""Centralized logging configuration for the application."""

import logging
import sys


def configure_logging():
    """Configure a consistent log format across the application."""
    logger = logging.getLogger("finrelief")
    if logger.handlers:
        return logger  # already configured

    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger
