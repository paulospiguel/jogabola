"use client";

import { format } from "date-fns";
import { useState } from "react";

import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { CalendarIcon, PlusCircle, X } from "lucide-react";

import { useServerActionMutation } from "@/hooks/server-action-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlayerCreateInput } from "@/types";
import { Calendar } from "@repo/ui/components/calendar";
import { cn } from "@repo/ui/utils";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createNewPlayer } from "@/actions/player";

export const AddNewPlayer = () => {
  const [closeDrawer, setOnClose] = useState(false);

  const form = useForm<PlayerCreateInput>({
    resolver: zodResolver(PlayerCreateInput),
    defaultValues: {
      name: undefined,
      bio: undefined,
      birth_date: new Date(),
      teamId: undefined,
    },
  });

  const onSubmit = async (values: PlayerCreateInput) => {
    await createNewPlayer(values);
  };

  return (
    <Drawer>
      <DrawerTrigger>
        <Button variant="outline" className="">
          <PlusCircle className="mr-2 h-5 w-5" />
          New player
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="relative">
          <DrawerClose className="absolute right-2 top-0">
            <X className="h-5 w-5" />
          </DrawerClose>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-4 space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Player name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input placeholder="Player bio" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="birth_date">Birth day</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DrawerContent>
      <DrawerFooter> </DrawerFooter>
    </Drawer>
  );
};
