//import Image from "next/image";
import { Input } from "@jogabola/ui/input";
import { ImageUp } from "lucide-react";

type PreviewLogoProps = React.InputHTMLAttributes<HTMLInputElement> & {
	image: string | undefined;
	updateImage: (image: string) => void;
};

export function PreviewLogo({ image, onChange, updateImage, ...props }: PreviewLogoProps) {
	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
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
					className="text-sm flex flex-col justify-center items-center text-center text-gray-500"
				>
					<ImageUp className="w-8 h-8 mr-2" /> Upload Team Logo
				</label>
				<Input type="file" id="logo" {...props} className="hidden" accept="image/*" onChange={handleLogoChange} />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border border-green-600 rounded-lg">
			<div className="w-32 h-32 bg-gray-200 rounded-full  border-green-600">
				<img src={image} alt="Preview" className="w-full h-full object-cover rounded-full" />
			</div>
		</div>
	);
}
