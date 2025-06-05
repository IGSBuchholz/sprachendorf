import { prisma } from "@/lib/prisma";
import type { Course } from "@prisma/client";
import {redis} from "@/lib/redis";

let countrieCache: Course[] = [];
let lastFetch: number;

export async function getCountries(): Promise<Course[]> {
  if(await redis.exists("countries")){
    let countries = JSON.parse((await redis.get("countries"))!)
    return countries;
  }

  let countries = await prisma.course.findMany();
  return countries;

}