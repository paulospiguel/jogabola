"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Text } from "./ui/Text";
import { supabase } from "@/services/supabase";

const CountDownTimer = () => {
  const [countDownTime, setCountDownTIme] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const t = useTranslations("countDown");

  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const [launchDate, setLaunchDate] = useState<Date | null>(null);

  const getTimeDifference = (targetTime: number) => {
    const currentTime = new Date().getTime();
    const timeDifference = targetTime - currentTime;

    const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (timeDifference % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (timeDifference % (60 * 60 * 1000)) / (1000 * 60),
    );
    const seconds = Math.floor((timeDifference % (60 * 1000)) / 1000);

    if (timeDifference < 0) {
      setCountDownTIme({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      });
      if (intervalId.current) clearInterval(intervalId.current);
    } else {
      setCountDownTIme({
        days: days < 10 ? `0${days}` : String(days),
        hours: hours < 10 ? `0${hours}` : String(hours),
        minutes: minutes < 10 ? `0${minutes}` : String(minutes),
        seconds: seconds < 10 ? `0${seconds}` : String(seconds),
      });
    }
  };

  useEffect(() => {
    const fetchLaunchDate = async () => {
      const { data, error } = await supabase
        .from("countdowns")
        .select("launch_date")
        .eq("slug", "launch-countdown")
        .eq("is_active", true)
        .maybeSingle(); // allows no data without throwing error

      if (error) {
        console.error("Erro a buscar o countdown:", error);
      } else if (!data) {
        console.warn(
          "Nenhum countdown ativo encontrado com o slug 'launch-countdown'.",
        );
      } else {
        setLaunchDate(new Date(data.launch_date));
      }
    };

    fetchLaunchDate();
  }, []);

  useEffect(() => {
    if (!launchDate) return;

    intervalId.current = setInterval(() => {
      getTimeDifference(launchDate.getTime());
    }, 1000);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [launchDate]);

  if (!launchDate) {
    return <div className="p-6 text-center">A carregar...</div>;
  }

  return (
    <div className="my-4 p-6">
      <div className="flex h-full w-full flex-col items-center justify-center gap-8 sm:gap-2">
        <Text
          color="gradient"
          className="pb-0 text-center tracking-wider"
          variant={"h2"}
        >
          {t("title")}
        </Text>
        <Text variant="lead">{t("subtitle")}</Text>
        <div className="mt-4 flex justify-center gap-3 sm:gap-8">
          <div className="relative flex flex-col gap-5">
            <div className="flex h-16 w-16 items-center justify-between rounded-lg bg-[#343650] sm:h-32 sm:w-32 lg:h-40 lg:w-40">
              <div className="relative !-left-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
              <span className="text-3xl font-semibold text-[#a5b4fc] sm:text-6xl lg:text-7xl">
                {countDownTime?.days}
              </span>
              <div className="relative -right-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
            </div>
            <span className="text-center text-xs text-[#8486A9] capitalize sm:text-2xl">
              {Number(countDownTime?.days) == 1 ? t("day") : t("days")}
            </span>
          </div>
          <div className="relative flex flex-col gap-5">
            <div className="flex h-16 w-16 items-center justify-between rounded-lg bg-[#343650] sm:h-32 sm:w-32 lg:h-40 lg:w-40">
              <div className="relative !-left-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
              <span className="text-3xl font-semibold text-[#a5b4fc] sm:text-6xl lg:text-7xl">
                {countDownTime?.hours}
              </span>
              <div className="relative -right-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
            </div>
            <span className="text-center text-xs font-medium text-[#8486A9] sm:text-2xl">
              {Number(countDownTime?.hours) == 1 ? t("hour") : t("hours")}
            </span>
          </div>
          <div className="relative flex flex-col gap-5">
            <div className="flex h-16 w-16 items-center justify-between rounded-lg bg-[#343650] sm:h-32 sm:w-32 lg:h-40 lg:w-40">
              <div className="relative !-left-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
              <span className="text-3xl font-semibold text-[#a5b4fc] sm:text-6xl lg:text-7xl">
                {countDownTime?.minutes}
              </span>
              <div className="relative -right-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
            </div>
            <span className="text-center text-xs text-[#8486A9] capitalize sm:text-2xl">
              {Number(countDownTime?.minutes) == 1 ? t("minute") : t("minutes")}
            </span>
          </div>
          <div className="relative flex flex-col gap-5">
            <div className="flex h-16 w-16 items-center justify-between rounded-lg bg-[#343650] sm:h-32 sm:w-32 lg:h-40 lg:w-40">
              <div className="relative !-left-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
              <span className="text-3xl font-semibold text-[#a5b4fc] sm:text-6xl lg:text-7xl">
                {countDownTime?.seconds}
              </span>
              <div className="relative -right-[6px] h-2.5 w-2.5 rounded-full bg-[#191A24] sm:h-3 sm:w-3"></div>
            </div>
            <span className="text-center text-xs text-[#8486A9] capitalize sm:text-2xl">
              {Number(countDownTime?.seconds) == 1 ? t("second") : t("seconds")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountDownTimer;
