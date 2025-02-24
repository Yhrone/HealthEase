"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form
} from "@/components/ui/form"
import { getAppointmentSchema, UserFormValidation } from "@/lib/validation"

import CustomFormField, { FormFieldType } from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { Dispatch, SetStateAction, useState } from "react"
import { useRouter } from "next/navigation"
import { SelectItem } from "@/components/ui/select";
import Image from "next/image"
import { Doctors } from "@/constants"
import PatientForm from "./PatientForm"
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions"
import { Appointment } from "@/types/appwrite.types"


export const  AppointmentForm =({
  userId,patientId,type,appointment,setOpen
}:{ 
  userId:string;
  patientId:string,
  type:"create"|"schedule"|"cancel";
  appointment?:Appointment; 
  setOpen?: Dispatch<SetStateAction<boolean>>;
})=> {
  const router = useRouter()
  const [isLoading,setIsLoading]= useState(false)
  // 1. Define your form.
  const AppointmentFormValidation = getAppointmentSchema(type);
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  })
 
  // 2. Define a submit handler.
  const onSubmit=async(values: z.infer<typeof AppointmentFormValidation>)=> {
    console.log('IM SUBMIT')
    setIsLoading(true)
    let status;
    switch (type) {
      case 'schedule':
        status = 'schedule';
        break;
      case 'cancel':
        status = 'cancel'
        break;
      default:
        status='pending'
        
    }
    console.log('BEFORE THE TYPE',type)

    try{
      if(type === 'create' ){
        console.log(patientId)
        const appointmentData = {
          userId,
          patient:patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason:values.reason!,
          note:values.note,
          status: status as Status,
        }
        const appointment= await createAppointment(appointmentData);

        if(appointment){
          form.reset();
          router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.id}`)

        }
      } else{
        console.log('cancel')

        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type
        }
        const updatedAppointment =await updateAppointment(appointmentToUpdate)
        if(updatedAppointment){
          
          setOpen && setOpen(false);
          form.reset();
        }
      }

    }catch(error){
      console.log(error)
    }
    setIsLoading(false)

  }
  let buttonLabel;
  switch(type){
    case 'cancel':
      buttonLabel = 'Cancel Appointment';
      break;
    case 'create':
      buttonLabel = 'Create Appointment';
      break;
    case 'schedule':
      buttonLabel= 'Schedule Appointment';
      break;
    default:
      break;
  }
   return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">Request a new appointment in 10 seconds</p>
          </section>
        )}
        
        {type !== "cancel" && (
      <>
        <CustomFormField 
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="primaryPhysician"
                label="Primary Physician"
                placeholder="Select a Physician"
                iconSrc="/assets/icons/email.svg"           
        >
          {Doctors.map((doctor,i)=>(
            <SelectItem key={doctor.name +i} value={doctor.name}>
              <div className="flex cursor-pointer items-center gap-2">
                <Image
                  src={doctor.image}
                  width={32}
                  height={32}
                  alt="doctor"
                  className="rounded-full border border-dark-500"
                />
                <p>{doctor.name}</p>
              </div>
            </SelectItem>
          ))}
        </CustomFormField>
        <CustomFormField
               fieldType={FormFieldType.DATE_PICKER}
               control={form.control}
               name="schedule"
               label="Expected appointment date"
               showTimeSelect
               dateFormat="MM/dd/yyyy - h:mm aa" children={undefined}        />

        <div className={`flex flex-col gap-6  ${type === "create" && "xl:flex-row"}`}>
        <CustomFormField
                 fieldType={FormFieldType.TEXTAREA}
                 control={form.control}
                 name="reason"
                 disabled={type === "schedule"}
                 label="Reason for appointment" children={undefined}          
        />
        <CustomFormField
                 fieldType={FormFieldType.TEXTAREA}
                 control={form.control}
                 name="note"
                 label="Notes"
                 disabled={type === "schedule"}
                 placeholder="Enter notes"          
                children={undefined}          
        />
        </div>
      </>
      )}

      {type === "cancel" && (
        <CustomFormField 
             fieldType={FormFieldType.TEXTAREA}
             control={form.control}
             name="cancellationReason"
             label="Reason for cancellation"
             placeholder="Enter reason for cancellation" children={undefined}        />
      )}
        
        <SubmitButton isLoading={isLoading} className={`${type === 'cancel' ? 'shad-danger-btn':'shad-primary-btn'} w-full`}>
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  )
}
export default AppointmentForm