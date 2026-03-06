import { useState, useEffect, useRef, useCallback } from 'react';

// Extensão das tipagens globais para suportar a Web Speech API no TypeScript
// (Como é uma API nativa do navegador, o TS precisa de saber que ela existe)
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface UseSpeechToTextReturn {
    /** Indica se o microfone está ativamente a escutar */
    isRecording: boolean;
    /** O texto que está a ser reconhecido em tempo real */
    transcript: string;
    /** Mensagem de erro, caso o utilizador negue o microfone ou não haja suporte */
    error: string | null;
    /** Indica se o navegador atual suporta esta tecnologia */
    isSupported: boolean;
    /** Inicia a gravação */
    startRecording: () => void;
    /** Para a gravação e consolida o texto final */
    stopRecording: () => void;
    /** Limpa a transcrição atual da memória */
    clearTranscript: () => void;
}

/**
 * @hook useSpeechToText
 * @description Trabalhador invisível para reconhecimento de voz nativo do navegador (Free).
 * Isola a complexidade da Web Speech API, gerindo permissões e transcrição em tempo real.
 */
export const useSpeechToText = (): UseSpeechToTextReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Guardamos a instância da API numa referência para não a perdermos a cada renderização
    const recognitionRef = useRef<any>(null);

    // Verificamos o suporte do navegador (Chrome, Edge e Safari suportam, Firefox requer flags)
    const isSupported = typeof window !== 'undefined' && 
                       (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

    // Inicialização da API apenas uma vez quando o componente é montado
    useEffect(() => {
        if (!isSupported) return;

        // Instancia o construtor correto dependendo do navegador
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        // Configurações de Qualidade Extrema
        recognitionRef.current.continuous = true; // Continua a gravar mesmo que o utilizador faça pausas
        recognitionRef.current.interimResults = true; // Mostra as palavras enquanto estão a ser ditas (Feedback em tempo real)
        recognitionRef.current.lang = 'pt-BR'; // Forçamos o idioma (pode ser ajustado conforme a localização do seu ERP)

        // Handlers de Eventos da API
        recognitionRef.current.onstart = () => {
            setIsRecording(true);
            setError(null);
        };

        recognitionRef.current.onresult = (event: any) => {
            let currentTranscript = '';
            // A API devolve os resultados em blocos, iteramos sobre eles para montar a frase
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('❌ [Web Speech API] Erro:', event.error);
            setIsRecording(false);
            
            // Tradução dos erros comuns para o utilizador
            if (event.error === 'not-allowed') {
                setError('Permissão do microfone negada. Por favor, autorize no navegador.');
            } else if (event.error === 'no-speech') {
                // Não é um erro crítico, apenas silêncio. Não bloqueamos a UI.
            } else {
                setError(`Erro no reconhecimento de voz: ${event.error}`);
            }
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };

        // Limpeza (Cleanup) ao desmontar o componente
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSupported]);

    /** Inicia a escuta */
    const startRecording = useCallback(() => {
        if (!isSupported) {
            setError('O seu navegador não suporta reconhecimento de voz. Recomendamos o Google Chrome.');
            return;
        }
        setError(null);
        try {
            recognitionRef.current.start();
        } catch (err) {
            console.warn('Gravação já estava iniciada.');
        }
    }, [isSupported]);

    /** Para a escuta */
    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
        }
    }, [isRecording]);

    /** Limpa o texto da memória local */
    const clearTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isRecording,
        transcript,
        error,
        isSupported,
        startRecording,
        stopRecording,
        clearTranscript
    };
};