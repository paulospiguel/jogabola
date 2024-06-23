import { cn } from "@/lib/utils";
import Image from "next/image";

type InfiniteHorizontalScrollProps = {
	images: string[];
	imageStyles?: {
		width?: number;
		height?: number;
		className?: React.ComponentProps<"img">["className"];
	};
};

const InfiniteHorizontalScroll: React.FC<InfiniteHorizontalScrollProps> = ({ images, imageStyles }) => {
	const { className, height, width } = imageStyles || {
		className: "",
		width: 50,
		height: 50,
	};

	return (
		<section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12">
			<div
				x-data="{}"
				x-init="$nextTick(() => {
        let ul = $refs.logos;
        ul.insertAdjacentHTML('afterend', ul.outerHTML);
        ul.nextSibling.setAttribute('aria-hidden', 'true');
    })"
				className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
			>
				<ul
					x-ref="logos"
					className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
				>
					{images?.map((srcImage) => {
						return (
							<li key={srcImage} className={cn("flex items-center justify-center", className)}>
								<Image src={srcImage} alt="Picture of the author" height={height} width={width} />
							</li>
						);
					})}
				</ul>
				<ul
					x-ref="logos"
					className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
				>
					{images.map((srcImage) => {
						return (
							<li key={srcImage} className={cn("flex items-center justify-center", className)}>
								<Image src={srcImage} alt="Picture of the author" height={height} width={width} />
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
};

export default InfiniteHorizontalScroll;
