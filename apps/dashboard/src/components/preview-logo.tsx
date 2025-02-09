//import Image from "next/image";
import { Input } from "@repo/ui/components/input";
import { ImageUp } from "@repo/ui/icons";

type PreviewLogoProps = React.InputHTMLAttributes<HTMLInputElement> & {
  image: string | undefined;
  updateImage: (image: string) => void;
};

export function PreviewLogo({
  image,
  onChange,
  updateImage,
  ...props
}: PreviewLogoProps) {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        updateImage(e?.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!image) {
    return (
      <div>
        <label
          htmlFor="logo"
          aria-readonly
          className="flex flex-col items-center justify-center text-center text-sm text-gray-500"
        >
          <ImageUp className="mr-2 h-8 w-8" /> Upload Team Logo
        </label>
        <Input
          type="file"
          id="logo"
          {...props}
          className="hidden"
          accept="image/*"
          onChange={handleLogoChange}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-green-600 bg-gray-100">
      <div className="h-32 w-32 rounded-full border-green-600 bg-gray-200">
        <img
          src={image}
          alt="Preview"
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    </div>
  );
}
