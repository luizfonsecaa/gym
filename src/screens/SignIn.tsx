import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from 'native-base'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

import BackgroundImg from '@assets/background.png'
import LogoSvg from '@assets/logo.svg'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { AuthNavigationRoutesProps } from '@routes/auth.routes'
import { AppError } from '@utils/AppError';
import { useAuth } from '@hooks/useAuth';
import { useState } from 'react';


type FormDataProps = {
  email: string
  password: string
}


const signInSchema = yup.object({
  email: yup.string().required('informe o e-mail.').email('E-mail inválido.'),
  password: yup.string().required('Informe a senha.'),
})


export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<AuthNavigationRoutesProps>()
  const toast = useToast()
  const { signIn } = useAuth()

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(signInSchema)
  })



  async function handleLogin({ email, password }: FormDataProps) {
    try {
      setIsLoading(true)
      await signIn(email, password)

    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : "Não foi possivel criar a conta tente novamente mais tarde"

      setIsLoading(false)
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.400',
      })
    }
  }

  function handleNewAccount() {
    navigation.navigate('signUp')
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
          defaultSource={BackgroundImg}
        />

        <Center my={24}>
          <LogoSvg />
          <Text color="gray.100" fontSize="sm" >Treine sua mente e o seu corpo</Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" fontFamily="heading" mb={6}>
            Acesse sua conta
          </Heading>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='E-mail'
                keyboardType='email-address'
                autoCapitalize='none'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Senha'
                secureTextEntry
                onChangeText={onChange}
                returnKeyType='send'
                onSubmitEditing={handleSubmit(handleLogin)}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button
            title='Acessar'
            onPress={handleSubmit(handleLogin)}
            isLoading={isLoading}
          />
        </Center>

        <Center mt={24}>
          <Text color="gray.100" fontSize="sm" mb={3}>Ainda não tem acesso? </Text>
          <Button
            title='Criar conta'
            variant="outline"
            onPress={handleNewAccount}
          />
        </Center>
      </VStack>
    </ScrollView>
  )
}