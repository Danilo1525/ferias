import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';  // Para animação de fogos de artifício
import { Audio } from 'expo-av';  // Para som de fogos

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [sound, setSound] = useState(null);  // Som dos fogos

  // Carrega mensagens salvas ao iniciar o app
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem('messages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };
    loadMessages();
  }, []);

  // Salva mensagens no AsyncStorage
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
    }
  };

  // Função para tocar o som de fogos de artifício
  const playFireworksSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/fireworks.mp3')  // Adicione seu arquivo de som de fogos aqui
    );
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    const targetDate = new Date('2024-12-20T00:00:00');
    const timezoneOffset = new Date().getTimezoneOffset();
    const gmtOffset = -240;

    targetDate.setMinutes(targetDate.getMinutes() + timezoneOffset + gmtOffset);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(interval);
        setCountdownFinished(true);
        playFireworksSound();  // Toca o som de fogos
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddMessage = () => {
    if (!name.trim() || !message.trim()) {
      alert('Por favor, insira um nome e uma mensagem.');
      return;
    }
    const newMessage = { id: Date.now().toString(), name, message };
    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setName('');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      {/* Contagem regressiva */}
      {!countdownFinished ? (
        <>
          <Text style={styles.text}>Férias começam em:</Text>
          <Text style={styles.time}>
            {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.finishedText}>Boas férias, um Natal cheio de alegria e um excelente final de ano! Até 2025, no nosso último ano de escola!</Text>
          {/* Animação de fogos de artifício */}
          <LottieView
            source={require('./assets/fireworks.json')}  // Adicione seu arquivo Lottie de fogos aqui
            autoPlay
            loop={false}
            style={styles.fireworksAnimation}
          />
        </>
      )}

      {/* Formulário para adicionar mensagens */}
      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Deixe uma mensagem"
        value={message}
        onChangeText={setMessage}
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddMessage}
      >
        <Text style={styles.buttonText}>Adicionar Mensagem</Text>
      </TouchableOpacity>

      {/* Lista de mensagens */}
      <Text style={styles.messagesTitle}>Mensagens:</Text>
      <FlatList
        data={showAllMessages ? messages : messages.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.messageText}>
              <Text style={styles.messageAuthor}>{item.name}: </Text>
              {item.message}
            </Text>
          </View>
        )}
      />

      {/* Botão "Ver mais" */}
      {messages.length > 5 && (
        <TouchableOpacity onPress={() => setShowAllMessages(!showAllMessages)}>
          <Text style={styles.viewMore}>
            {showAllMessages ? 'Ver menos' : 'Ver mais'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',  // Fundo preto
  },
  fireworksAnimation: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
    color: '#fff',  // Texto branco
  },
  finishedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',  // Texto branco
    marginBottom: 20,
    textAlign: 'center',
  },
  time: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',  // Texto branco
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#333',  // Campo de entrada com fundo escuro
    color: '#fff',  // Texto branco
  },
  messagesTitle: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#fff',  // Texto branco
  },
  messageItem: {
    backgroundColor: '#444',  // Mensagem com fundo escuro
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    width: '100%',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',  // Texto branco
  },
  messageAuthor: {
    fontWeight: 'bold',
    color: '#007BFF',  // Autor com cor diferente
  },
  viewMore: {
    fontSize: 16,
    color: '#007BFF',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007BFF',  // Cor de fundo do botão
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',  // Cor do texto do botão
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Countdown;
