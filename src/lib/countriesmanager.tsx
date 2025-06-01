import { prisma } from "@/lib/prisma";
import type { Course } from "@prisma/client";

let countrieCache: Course[] = [];
let lastFetch: number;

export async function getCountries(): Promise<Course[]> {
  if (!lastFetch) {
    console.log("refedinedas");
    lastFetch = Date.now();
  }

  console.log("Lastfetch", lastFetch);
  console.log(Date.now() - lastFetch);

  if (!(countrieCache.length > 0 || (Date.now() - lastFetch) > 10 * 60 * 10000)) {
    countrieCache = await prisma.course.findMany();
  }

  console.log("CC" + countrieCache);

  return countrieCache;
}