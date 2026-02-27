import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';

export default function SanctionSourcesDialog(): React.ReactNode {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer text-blue-700 underline underline-offset-4 decoration-blue-700 hover:opacity-95 transition-all">
        sources
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sanction Sources</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <div className="flex flex-row gap-4 items-center">
            <picture>
              <source
                type="image/webp"
                srcSet="https://flagcdn.com/h20/id.webp,
                        https://flagcdn.com/h40/id.webp 2x,
                        https://flagcdn.com/h60/id.webp 3x"
              />
              <source
                type="image/png"
                srcSet="https://flagcdn.com/h20/id.png,
                        https://flagcdn.com/h40/id.png 2x,
                        https://flagcdn.com/h60/id.png 3x"
              />
              <img
                src="https://flagcdn.com/h40/id.png"
                className="rounded-xs bg-black border"
                height="20"
                alt="Ukraine"
              />
            </picture>

            <Link
              href="https://google.com"
              target="_blank"
              className="text-blue-700 hover:opacity-95 text-lg underline underline-offset-4 decoration-blue-700 py-1"
            >
              Indonesia List
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
