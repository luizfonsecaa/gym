import { HistoryCard } from "@components/HistoryCard";
import { Loading } from "@components/Loading";
import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { Heading, VStack, SectionList, Text, useToast, Center } from "native-base";
import { useCallback, useState } from 'react';


export function History() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);


  async function fechHistory() {
    try {
      setIsLoading(true)
      const { data } = await api.get(`history`)
      setExercises(data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : "Erro inesperado tente novamente mais tarde."
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.400',
      })
    } finally {
      setIsLoading(false)
    }
  }


  useFocusEffect(useCallback(() => {
    fechHistory()
  }, []))

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercícios" />
      {isLoading ? <Loading /> : (
        exercises?.length > 0 ?
          <SectionList
            sections={exercises}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <HistoryCard data={item} />
            )}
            renderSectionHeader={({ section }) => (
              <Heading color='gray.200' fontSize='md' fontFamily='heading' mt={10} mb={3}> {section.title}</Heading>
            )}
            contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: 'center' }}
            ListEmptyComponent={() => (
              <Text color='gray.100' textAlign='center'>
                Não há exercicios registrado ainda.{'\n'}
                Vamos fazer exercícios hoje?
              </Text>
            )}
            px={5}
            showsVerticalScrollIndicator={false}
          />
          :
          <Center flex={1}>
            <Text color='gray.100' textAlign='center'>
              Não há exercicios registrado ainda.{'\n'}
              Vamos fazer exercícios hoje?
            </Text>
          </Center>
      )

      }
    </VStack>
  )
}