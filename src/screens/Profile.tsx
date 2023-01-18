import { Center, ScrollView, Text, VStack, Skeleton, TextArea, Heading, useToast } from "native-base";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';

const PHOTO_SIZE = 33

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState('https://github.com/luizfonsecaa.png')

  const toast = useToast()

  async function handleUserPhotoSelect() {
    try {
      setPhotoIsLoading(true)
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,

      })

      if (photoSelected.canceled) return

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri)
        if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
          return toast.show({
            title: 'Essa Imagem é muito grande. Escolha uma de ate 5MB',
            placement: 'top',
            bgColor: 'red.500'
          })
        }
        setUserPhoto(photoSelected.assets[0].uri)
      }

    } catch (error) {

    } finally {
      setPhotoIsLoading(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 1 }}>
        <Center mt={6} px={10}>
          {
            photoIsLoading ?
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded='full'
                startColor='gray.500'
                endColor='gray.400'
              />
              :
              <UserPhoto
                source={{ uri: userPhoto }}
                alt="Image do usuário"
                size={PHOTO_SIZE}
              />
          }
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color='green.500' fontWeight="bold" fontSize="md" mt={2} mb={8}>
              Alterar Photo
            </Text>
          </TouchableOpacity>

          <Input
            bg="gray.600"
            placeholder="Nome"
          />
          <Input
            bg="gray.600"
            placeholder="E-mail"
            // value="luiz.otavio@take5.com.br"
            isDisabled
          />

        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color="gray.200" fontFamily='heading' fontSize="md" mb={2}>
            Alterar senha
          </Heading>

          <Input
            bg="gray.600"
            placeholder="Senha antiga"
            secureTextEntry
          />
          <Input
            bg="gray.600"
            placeholder="Senha nova"
            secureTextEntry
          />

          <Input
            bg="gray.600"
            placeholder="Confirme a nova senha"
            secureTextEntry
          />

          <Button
            title="Atualizar"
            mb={4}
          />

        </VStack>
      </ScrollView>
    </VStack>
  )
}