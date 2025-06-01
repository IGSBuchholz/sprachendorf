import { prisma } from "@/lib/prisma";
import type {User, Course, Role} from "@prisma/client";
import { getCountries } from "@/lib/countriesmanager";

export async function getUser(emailAddress: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: { email: emailAddress.toLowerCase() }
  });
}

export async function updateUserLastRequest(email: string, lastRequestDate: Date): Promise<void> {
  await prisma.user.updateMany({
    where: { email: email.toLowerCase() },
    data: { lastRequest: lastRequestDate.toDateString() }
  });
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
  return newUser;
}

export async function checkCountry(user: User): Promise<User> {
  if (user.role !== "USER") {
    if (user.startcountry) {
      await prisma.user.updateMany({
        where: { email: user.email.toLowerCase() },
        data: { startcountry: "" }
      });
      user.startcountry = "";
    }
  }

  if (user.startcountry === "Polen" || user.startcountry === "Kanada") {
    const chosenCountry = await chooseCountry();
    await prisma.user.updateMany({
      where: { email: user.email.toLowerCase() },
      data: { startcountry: chosenCountry.country }
    });
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


export function roleIsGreaterOrEqual(inputRole: Role, comparisonRole: Role): boolean {

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
    return true;
  } catch (e) {
    return false;
  }
}
