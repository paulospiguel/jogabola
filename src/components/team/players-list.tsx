"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, MessageSquareShare } 
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MIN_AGE = 16;
const MIN_NAME = 5;

const positions = [
  "goalkeeper",
  "leftBack",
  "rightBack",
  "centerBack",
  "midfielder",
  "forward",
  "defensiveMidfielder",
  "striker",
  "unknown",
];

const nationalities = [
  { value: "🇵🇹", label: "portugal" },
  { value: "🇧🇷", label: "brazil" },
  { value: "🇦🇴", label: "angola" },
  { value: "🇨🇻", label: "capeVerde" },
  { value: "🇬🇼", label: "guineaBissau" },
  { value: "🇲🇿", label: "mozambique" },
  { value: "🇮🇳", label: "india" },
  { value: "🇳🇵", label: "nepal" },
  { value: "🇺🇦", label: "ukraine" },
  { value: "🇨🇳", label: "china" },
];

const initialPlayers = [
  {
    id: 1,
    name: "Carlos Silva",
    position: "forward",
    number: 10,
    nationality: "🇧🇷",
    invited: false,
  },
  {
    id: 2,
    name: "João Oliveira",
    position: "midfielder",
    number: 8,
    nationality: "🇵🇹",
    invited: false,
  },
  {
    id: 3,
    name: "Pedro Santos",
    position: "centerBack",
    number: 4,
    nationality: "🇧🇷",
    invited: true,
  },
  {
    id: 4,
    name: "André Gomes",
    position: "goalkeeper",
    number: 1,
    nationality: "🇦🇷",
    invited: false,
  },
];

const AddPlayerSchema = z.object({
  name: z.string().min(MIN_NAME, "nameMustHaveAtLeastFiveCharacters"),
  age: z
    .number({
      invalid_type_error: "invalidAge",
    })
    .min(MIN_AGE, "minimumAgeIsSixteen")
    .optional(),
  tshirtNumber: z
    .number({
      invalid_type_error: "invalidNumber",
    })
    .min(0)
    .max(99)
    .optional(),
  position: z.enum(positions).optional(),
  nationality: z.enum(nationalities.map(n => n.value)).optional(),
  invited: z.boolean().default(false).optional(),
  email: z.string().email("invalidEmail"),
  phone: z.string().optional(),
});

const PlayerList = ({ hasEditPermission }: { hasEditPermission: boolean }) => {
  const [players, setPlayers] = useState(initialPlayers);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof AddPlayerSchema>>({
    resolver: zodResolver(AddPlayerSchema),
  });

  const addPlayer = (data: z.infer<typeof AddPlayerSchema>) => {
    setPlayers([
      ...players,
      {
        id: Date.now(),
        name: data.name,
        position: data?.position,
        number: data?.tshirtNumber,
        nationality: data?.nationality,
        invited: false,
      },
    ]);
    reset();
  };

  const toggleInvite = (id: number) => {
    setPlayers(
      players.map(player =>
        player.id === id ? { ...player, invited: !player.invited } : player,
      ),
    );
  };

  const t = useTranslations();

  return (
    <>
      {/* Players List */}
      <div className="mb-4 w-full overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-primary py-2 text-center text-lg font-semibold text-white">
          {t("tabs.squad")}
        </div>
        <div className="p-4">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {players.map(player => (
              <li
                key={player.id}
                className="flex items-center rounded-lg bg-gray-50 p-3"
              >
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold uppercase text-white">
                  {player.number || player.name.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">
                    {player.name} {player.nationality}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t(`player.${player.position || "unknown"}`)}
                  </p>
                </div>
                <div className="ml-auto flex space-x-2">
                  {player.invited && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleInvite(player.id)}
                    >
                      {t("global.toInvite")}
                    </Button>
                  )}
                  <Button variant="link" size="sm">
                    <MessageSquareShare className="mr-2 size-6" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Player Sheet */}
      {hasEditPermission && (
        <Sheet>
          <SheetTrigger className="hover:bg-primary/80 absolute bottom-2 right-2 flex items-center rounded-full bg-primary px-4 py-2 text-white shadow-md hover:brightness-110">
            <Plus className="mr-2 h-4 w-4" /> {t("global.addPlayer")}
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>{t("global.addPlayer")}</SheetTitle>
              <SheetDescription>
                {t("tabs.fillInTheFieldsBelowToAddAPlayerToTheSquad")}
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleSubmit(addPlayer)}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>{t("player.playerName")}</Label>
                  <Input
                    {...register("name")}
                    placeholder={t("player.playerName")}
                    className="border px-3 py-2"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {t(`errors.${errors?.name?.message}`, {
                        count: MIN_NAME,
                      })}
                    </p>
                  )}
                </div>
                <div className="col-span-1 space-y-2">
                  <Label>{t("player.age")}</Label>
                  <Input
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    defaultValue={MIN_AGE}
                    placeholder={t("player.age")}
                    className="border px-3 py-2"
                  />
                  {errors.age && (
                    <p className="text-sm text-red-500">
                      {t(`errors.${errors?.age?.message}`)}
                    </p>
                  )}
                </div>
                <div className="col-span-1 space-y-2">
                  <Label>{t("player.nationality")}</Label>
                  <Select
                    {...register("nationality")}
                    onValueChange={value => setValue("nationality", value)}
                  >
                    <SelectTrigger className="border px-3 py-2">
                      <SelectValue placeholder={t("player.nationality")} />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map(nation => (
                        <SelectItem key={nation.value} value={nation.value}>
                          {nation.value} {t(`nationalities.${nation.label}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>{t("player.email")}</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder={t("player.email")}
                    className="border px-3 py-2"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {t(`errors.${errors?.email?.message}`)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("player.phone")}</Label>
                  <Input
                    {...register("phone")}
                    type="tel"
                    placeholder={t("player.phone")}
                    className="border px-3 py-2"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {t(`errors.${errors?.phone?.message}`)}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("player.tshirtNumber")}</Label>
                  <Input
                    type="number"
                    {...register("tshirtNumber", { valueAsNumber: true })}
                    defaultValue={0}
                    placeholder={t("player.tshirtNumber")}
                    className="border px-3 py-2"
                  />
                  {errors.tshirtNumber && (
                    <p className="text-sm text-red-500">
                      {t(`errors.${errors?.tshirtNumber?.message}`)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("player.position")}</Label>
                  <Select
                    {...register("position")}
                    onValueChange={value => setValue("position", value)}
                  >
                    <SelectTrigger className="border px-3 py-2">
                      <SelectValue placeholder={t("player.position")} />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(position => (
                        <SelectItem key={position} value={position}>
                          {t(`player.${position}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">{t("global.add")}</Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default PlayerList;
