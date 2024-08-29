"use client";

import { useEffect, useMemo, useRef } from "react";

export default function TextFlip({ title, messages = [] }: { title?: string; messages: string[] }) {
	const tallestRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (tallestRef.current) {
			let maxHeight = 0;

			for (const word of messages) {
				const span = document.createElement("span");
				span.className = "absolute opacity-0";
				span.textContent = word;
				tallestRef.current?.appendChild(span);
				const height = span.offsetHeight;
				tallestRef.current?.removeChild(span);

				if (height > maxHeight) {
					maxHeight = height;
				}
			}

			tallestRef.current.style.height = `${maxHeight}px`;
		}
	}, [messages]);

	return (
		<div className="box-content flex gap-4 text-sm font-semibold border rounded-xl p-2">
			<p className="">{title}</p>
			<div ref={tallestRef} className="flex flex-col overflow-hidden text-blue-400">
				{messages.map((word, index) => (
					<span key={index} className="animate-flip-words">
						{word}
					</span>
				))}
			</div>
		</div>
	);
}
