import Image from 'next/image'
import bgImage from '@/assets/bg.jpg'
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GENDER_OPTIONS } from '@/features/auth/constants/register-options';

export default function RegisterFormUI() {
    const t = useTranslations('auth');
    return (
        <div className='w-full min-h-screen'>
            <div className='w-full h-96 absolute top-0 z-0'>
                <Image src={bgImage} alt="Register Background" layout="fill" objectFit="cover" placeholder="blur" className="object-center " />
            </div>

            <div className='w-full h-full relative z-10'>
                {/* Register Form Content */}
                <div className='text-center text-3xl font-bold mt-30 text-white'>
                    {t('registerTitle')}
                </div>
                <div className='px-20 max-w-350 mx-auto my-10 '>
                    <Card>
                        <CardContent className="flex flex-col gap-6">
                            <FieldGroup>
                                {/* National ID */}
                                <Field>
                                    <FieldLabel htmlFor="nationalId">{t('nationalId')}</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="nationalId"
                                            placeholder="XXXXXXXXXXXXXX"
                                        />
                                    </FieldContent>
                                </Field>

                                {/* First Name */}
                                <Field >
                                    <FieldLabel htmlFor="firstName">{t('firstName')}</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="firstName"
                                        />
                                    </FieldContent>
                                </Field>

                                {/* Second Name */}
                                <Field>
                                    <FieldLabel htmlFor="secondName">{t('secondName')}</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="secondName"
                                            
                                        />
                                        
                                    </FieldContent>
                                </Field>

                                {/* Third Name */}
                                <Field >
                                    <FieldLabel htmlFor="thirdName">{t('thirdName')}</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="thirdName"
                                           
                                        />
                                        
                                    </FieldContent>
                                </Field>

                                {/* Fourth Name */}
                                <Field >
                                    <FieldLabel htmlFor="fourthName">{t('fourthName')}</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="fourthName"
                                            
                                        />
                                        
                                    </FieldContent>
                                </Field>

                                {/* Date of Birth */}
                                <Field >
                                    <FieldLabel htmlFor="dateOfBirth">{t('dateOfBirth')}</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            
                                        />
                                        
                                    </FieldContent>
                                </Field>

                                {/* Gender */}
                                <Field >
                                    <FieldLabel>{t('gender')}</FieldLabel>
                                    <FieldContent>
                                        <Select
                                            
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                
                                            >
                                                <SelectValue placeholder={t('gender')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GENDER_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {t(option.label)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
