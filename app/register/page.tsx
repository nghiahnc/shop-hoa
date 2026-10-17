import { randomUUID } from "node:crypto";
import StoreHeader from "@/app/store/StoreHeader";
import RegisterForm from "./RegisterForm";
import { currentUser } from "@/lib/session";
import { redirect } from "next/navigation";
export default async function RegisterPage() { const user = await currentUser(); if (user) redirect("/account/orders"); return <div className="storefront"><StoreHeader user={null}/><RegisterForm demoEmail={`demo-${randomUUID().slice(0,8)}@mochoa.local`}/></div>; }
