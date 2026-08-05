from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.mail import send_mail
import smtplib

class Command(BaseCommand):
    help = 'Tests SMTP email delivery with current settings'

    def add_arguments(self, parser):
        parser.add_argument('recipient', type=str, help='Recipient email address')

    def handle(self, *args, **options):
        recipient = options['recipient']
        self.stdout.write(self.style.NOTICE(f"Testing SMTP email dispatch to {recipient}..."))
        self.stdout.write(f"EMAIL_HOST: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        self.stdout.write(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")

        try:
            sent_count = send_mail(
                subject="Verixa SMTP Connection Test",
                message=f"Hello! This is a test email sent from Verixa backend to {recipient}.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"SUCCESS! Test email sent successfully to {recipient} (count: {sent_count})"))
        except smtplib.SMTPAuthenticationError as e:
            self.stdout.write(self.style.ERROR(
                f"SMTP AUTHENTICATION ERROR (535 Bad Credentials):\n{e}\n\n"
                f"HOW TO FIX:\n"
                f"1. Log into {settings.EMAIL_HOST_USER}\n"
                f"2. Enable 2-Step Verification at https://myaccount.google.com/signinoptions/two-step-verification\n"
                f"3. Generate a new App Password at https://myaccount.google.com/apppasswords\n"
                f"4. Update EMAIL_HOST_PASSWORD in your .env file."
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"EMAIL DISPATCH FAILED: {e}"))
