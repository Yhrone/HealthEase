"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form
} from "@/components/ui/form"
import { UserFormValidation } from "@/lib/validation"
import { createUser } from "@/lib/actions/patient.actions"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import CustomFormField, { FormFieldType } from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  username: z.string().min(2,{
    message:"Username must be at least 2 characters",
  })
})


const  PatientForm =()=> {
  const router = useRouter()
  const [isLoading,setIsLoading]= useState(false)
  // 1. Define your form.
  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email:"",
      phone:""
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit({name,email,phone}: z.infer<typeof UserFormValidation>) {
    setIsLoading(true)
    try{
      const userData = {name,email,phone};
      const user = await createUser(userData);
      if(user) router.push(`/patients/${user.$id}/register`)
    }catch(error){
      console.log(error)
    }
  }
   return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi There</h1>
          <p className="text-dark-700">Schedule your first appointment.</p>
        </section>
        <CustomFormField 
           fieldType={FormFieldType.INPUT}
           control={form.control}
           name="name"
           label="Full name"
           placeholder="John Deo"
           iconSrc="/assets/icons/user.svg"
           iconAlt="user" children={undefined}        />

        <CustomFormField 
           fieldType={FormFieldType.INPUT}
           control={form.control}
           name="email"
           label="Email"
           placeholder="JohnDeo@mail.com"
           iconSrc="/assets/icons/email.svg"
           iconAlt="email" children={undefined}        />

        <CustomFormField 
           fieldType={FormFieldType.PHONE_INPUT}
           control={form.control}
           name="phone"
           label="phone number"
           placeholder="(000)000 000"
           iconSrc="/assets/icons/email.svg" children={undefined}          
        />
        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  )
}
export default PatientForm