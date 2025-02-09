"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function ModalPage({ params: { slug = "" } }) {
  const router = useRouter();

  const videos = useMemo(() => {
    return {
      v1: (
        <figure className="relative h-full w-full">
          <svg
            viewBox="0 0 285 80"
            preserveAspectRatio="xMidYMid slice"
            className="absolute left-0 top-0 h-full w-full"
          >
            <title>JogaBola</title>
            <defs>
              <mask id="mask" x="0" y="0" width={"100%"} height={"100%"}>
                <rect
                  x="0"
                  y="0"
                  width={"100%"}
                  height={"100"}
                  style={{ fill: "white", mask: "url(#mask)" }}
                />
                <text
                  x="50%"
                  y="50%"
                  fill="red"
                  textAnchor="middle"
                  className="font-bold italic underline"
                >
                  JOGABOLA
                </text>
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width={"100%"}
              height={"100"}
              style={{ fill: "#000105", mask: "url(#mask)" }}
            />
          </svg>
          <video autoPlay muted loop className="h-full w-[80%]">
            <source
              src="https://res.cloudinary.com/dzl9yxixg/video/upload/5039487-hd_1366_720_25fps_fagjxp.mp4"
              type="video/mp4"
            />
          </video>
        </figure>
      ),
      v2: (
        <figure className="relative h-full w-full">
          <video
            autoPlay
            muted
            loop
            style={{
              maskImage:
                "url('https://res.cloudinary.com/dzl9yxixg/image/upload/2174691_o3eq9a.svg')",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
            className="relative aspect-square h-full w-full object-cover"
          >
            <source
              src="https://res.cloudinary.com/dzl9yxixg/video/upload/5039487-hd_1366_720_25fps_fagjxp.mp4"
              type="video/mp4"
            />
          </video>
        </figure>
      ),
      v3: (
        <iframe
          className="rounded-3xl"
          title="JogaBola"
          width="100%"
          height="418"
          src={`https://www.youtube.com/embed/${slug}?autoplay=1&mute=1`}
        />
      ),
    };
  }, [slug]);

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog
      modal={true}
      defaultOpen={true}
      open={true}
      onOpenChange={handleClose}
    >
      <DialogContent className="max-w-full md:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>{slug}</DialogTitle>
          <DialogDescription>{""}</DialogDescription>
        </DialogHeader>
        {videos.v3}
        <DialogFooter>{""}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
