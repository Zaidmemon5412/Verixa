import os
from django.core.management.base import BaseCommand, CommandError
from apps.builders.services import import_builder_projects_from_csv


class Command(BaseCommand):
    help = 'Import builder projects and migrate gallery images to Cloudinary from master_verixa_builder_projects.csv'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_path',
            nargs='?',
            type=str,
            default='master_verixa_builder_projects.csv',
            help='Path to the master builder projects CSV file'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            dest='dry_run',
            default=False,
            help='Validate CSV and report stats without saving to DB or uploading to Cloudinary'
        )

    def handle(self, *args, **options):
        csv_path = options['csv_path']
        dry_run = options['dry_run']

        if not os.path.isabs(csv_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
            possible_path = os.path.join(base_dir, csv_path)
            if os.path.exists(possible_path):
                csv_path = possible_path
            elif os.path.exists(os.path.join(os.path.dirname(base_dir), csv_path)):
                csv_path = os.path.join(os.path.dirname(base_dir), csv_path)

        if not os.path.exists(csv_path):
            raise CommandError(f"CSV file not found at path: {csv_path}")

        mode_str = "[DRY RUN VALIDATION]" if dry_run else "[LIVE IMPORT & CLOUDINARY MIGRATION]"
        self.stdout.write(self.style.WARNING(f"\n=================================================="))
        self.stdout.write(self.style.WARNING(f" Starting {mode_str}"))
        self.stdout.write(self.style.WARNING(f" Target File: {csv_path}"))
        self.stdout.write(self.style.WARNING(f"==================================================\n"))

        try:
            report = import_builder_projects_from_csv(file_path=csv_path, dry_run=dry_run)

            # Print execution logs
            for log_entry in report.get('logs', []):
                if '[ERROR]' in log_entry:
                    self.stdout.write(self.style.ERROR(log_entry))
                elif '[WARNING]' in log_entry:
                    self.stdout.write(self.style.WARNING(log_entry))
                else:
                    self.stdout.write(self.style.SUCCESS(log_entry))

            # Print Final Summary Report
            self.stdout.write(self.style.SUCCESS("\n=================================================="))
            self.stdout.write(self.style.SUCCESS("           BUILDER PROJECT IMPORT REPORT          "))
            self.stdout.write(self.style.SUCCESS("=================================================="))
            self.stdout.write(f" Mode:                     {'DRY-RUN' if report['dry_run'] else 'LIVE'}")
            self.stdout.write(f" Total Projects in CSV:    {report['total_projects_in_csv']}")
            self.stdout.write(f" Imported Projects:         {report['imported_projects']}")
            self.stdout.write(f" Updated Projects:          {report.get('updated_projects', 0)}")
            self.stdout.write(f" Skipped Projects:          {report['skipped_projects']}")

            self.stdout.write(f" Duplicate Projects:        {report['duplicate_projects']}")
            self.stdout.write(f" Missing Builders:          {report['missing_builders']}")
            self.stdout.write(f" Failed Projects:           {report['failed_projects']}")
            self.stdout.write("--------------------------------------------------")
            self.stdout.write(f" Total Images in CSV:      {report['total_images_in_csv']}")
            self.stdout.write(f" Imported Images:           {report['imported_images']}")
            self.stdout.write(f" Skipped Images:            {report['skipped_images']}")
            self.stdout.write(f" Duplicate Images:          {report['duplicate_images']}")
            self.stdout.write(f" Failed Image Uploads:      {report['failed_image_uploads']}")
            self.stdout.write(f" Invalid Image URLs:        {report['invalid_image_urls']}")
            self.stdout.write("--------------------------------------------------")
            self.stdout.write(f" Import Duration:           {report['import_duration_seconds']} seconds")
            self.stdout.write(self.style.SUCCESS("==================================================\n"))

        except Exception as e:
            raise CommandError(f"Error executing import: {str(e)}")

