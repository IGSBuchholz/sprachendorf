'use server'
import { prisma } from "@/lib/prisma";
import type {User, Course, Role} from "@prisma/client";
import { getCountries } from "@/lib/countriesmanager";
import {redis} from "@/lib/redis";
export async function getUser(emailAddress: string): Promise<User | null> {
  const email = emailAddress.toLowerCase();
  const cacheKey = `user:${email}`;
  // Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as User;
  }
  // Fetch from database if not in cache
  const user = await prisma.user.findFirst({
    where: { email }
  });
  console.log("retrieving user from db", user)
  if (user) {
    await redis.set(cacheKey, JSON.stringify(user));
  }
  return user;
}

export async function updateUserLastRequest(email: string, lastRequestDate: Date): Promise<void> {
  await prisma.user.updateMany({
    where: { email: email.toLowerCase() },
    data: { lastRequest: lastRequestDate.toDateString() }
  });
  const cacheKey = `user:${email.toLowerCase()}`;
  await redis.del(cacheKey);
}

export async function insertUser(
  email: string,
  role: Role = 'USER',
  lastRequestDate = Date.now()
): Promise<User> {
  const countryChosen = await chooseCountry();
  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      role: role,
      lastRequest: new Date(lastRequestDate).toString(),
      startcountry: countryChosen.country
    }
  });
  const cacheKey = `user:${email.toLowerCase()}`;
  await redis.set(cacheKey, JSON.stringify(newUser));
  return newUser;
}

export async function checkCountry(user: User): Promise<User> {
  if (user.role !== "USER") {
    if (user.startcountry) {
      await prisma.user.updateMany({
        where: { email: user.email.toLowerCase() },
        data: { startcountry: "" }
      });
      const cacheKey = `user:${user.email.toLowerCase()}`;
      await redis.del(cacheKey);
      user.startcountry = "";
    }
  }

  if (user.startcountry === "Polen" || user.startcountry === "Kanada") {
    const chosenCountry = await chooseCountry();
    await prisma.user.updateMany({
      where: { email: user.email.toLowerCase() },
      data: { startcountry: chosenCountry.country }
    });
    const cacheKey = `user:${user.email.toLowerCase()}`;
    await redis.del(cacheKey);
    user.startcountry = chosenCountry.country;
  }

  return user;
}

const nonCourse: Course = {
  id: 999,
  country: "ERROR",
  levels: 10,
  imglink: "/",
  maxusers: 999
};


export async function roleIsGreaterOrEqual(inputRole: Role, comparisonRole: Role): Promise<boolean> {

  switch (comparisonRole) {
    case "USER":
      return true;
    case "HELPER":
      return inputRole !== "USER";
    case "TEACHER":
      return !(inputRole === "USER" || inputRole === "HELPER");
    case "ADMIN":
      return inputRole === "ADMIN";
  }

}
export async function chooseCountry(
  timesCalled = 0
): Promise<Course> {
  if (timesCalled > 10) {
    return nonCourse;
  }
  const countries = await getCountries();
  const randomIndex = Math.floor(Math.random() * countries.length);
  const country = countries[randomIndex];

  const usersAlreadyCount = await prisma.user.count({
    where: { startcountry: country.country }
  });

  const selectCntry = await prisma.course.findFirst({
    where: { country: country.country }
  });

  if (selectCntry && selectCntry.maxusers !== null && usersAlreadyCount >= selectCntry.maxusers) {
    return chooseCountry(timesCalled + 1);
  }

  return country;
}

export async function setRole(
  email: string,
  newRole: Role = 'ADMIN',
): Promise<boolean> {
  try {
    await prisma.user.updateMany({
      where: { email: email.toLowerCase() },
      data: { role: newRole }
    });
    const cacheKey = `user:${email.toLowerCase()}`;
    await redis.del(cacheKey);
    return true;
  } catch (e) {
    return false;
  }
}
