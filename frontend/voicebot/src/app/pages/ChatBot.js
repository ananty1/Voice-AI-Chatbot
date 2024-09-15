"use client";

import { useEffect, useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import audioRecorder from './audioRecorder';
import axios from 'axios';
import Image from 'next/image'; // Assuming Next.js, or adjust as per your framework

const ChatBot = () => {


    const [audioUrl, setAudioUrl] = useState([]);  // State to hold the audio URL
    const [isRecording, setIsRecording] = useState(false);
    const conversationRef = useRef(null); // Ref for auto-scrolling to the bottom

    // Function to handle auto-scrolling to the latest conversation
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [audioUrl]);

    function startAudioRecording() {
        setIsRecording(true);

        audioRecorder.start()
            .then(() => {
                console.log("Recording audio...")
            })

            .catch((error) => {
                if (error.message.includes("mediaDevices API or getUserMedia method  is not supported in the browser.")) {
                    console.log("To record the audio, use Browsers like Chrome and FireFox");
                }

                switch (error.name) {
                    case 'AbortError':
                        console.log('An Abort Error has occurred');
                        break;

                    case 'NotAllowedError':
                        console.log('A Non AllowedError has occurred, User might have denied the permission');
                        break;
                    case 'NotFoundError':
                        console.log('A NotFoundError has occurred');
                        break;
                    case 'NonReadableError':
                        console.log("A NonReadableError has occurred");
                        break;
                    case 'SecurityError':
                        console.log("A Security Error has occrred");
                        break;
                    case 'TypeError':
                        console.log('A TypeError has occurred');
                        break;
                    case 'InvalidStateError':
                        console.log('An InvalidStateError has occurred');
                        break;
                    case 'UnknownError':
                        console.log('An UnknownError has occrred');
                        break;
                    default:
                        console.log("An error has occurred with the error name " + error.name);
                }
            })
    }


    function stopAudioRecording() {
        console.log(" Stoppping Audio Recording");
        setIsRecording(false);
        audioRecorder.stop()
            .then(async (audioAsBlob) => {
                console.log("Stopped with audio Blob:", audioAsBlob);
                const url = URL.createObjectURL(audioAsBlob);
                setAudioUrl(prevAudioUrls => [...prevAudioUrls, url]);

                const formdata = new FormData();
                formdata.append("file", audioAsBlob, "audioFile.wav");
                await axios.post(
                    "https://voice-ai-chatbot.vercel.app/post-audio", formdata, {
                    headers: { "Content-Type": "audio/mpeg" },
                    responseType: "arraybuffer",
                }
                )
                    .then((res) => {
                        // console.log("WE got ",res.data);

                        const audioBlob = new Blob([res.data], { type: 'audio/wav' });
                        const audiourl = URL.createObjectURL(audioBlob);

                        setAudioUrl(prevAudioUrls => [...prevAudioUrls, audiourl]);

                        const audio = new Audio(audiourl);
                        audio.play();

                    })
                    .catch((error) => {
                        console.log(error.message)
                    })




                // we will send to backend here
            })

            .catch(error => {
                switch (error.name) {
                    case 'InvalidStateError':
                        console.log("An InvalidStateError has occurred.");
                        break;
                    default:
                        console.log("An error has occurred with the error name " + error.name);

                }

            })
    }

    function cancelRecording() {
        console.log("Canceling the audio");

        audioRecorder.cancel();
        setIsRecording(false);
        // Do something after cancelled , nothing
    }



    return (
        <div className='relative flex flex-col min-h-screen padding-10 bg-slate-800' >
            {/* Page Title */}
            <h2 className='font-sans font-bold text-4xl text-white text-center mt-10'>VoiceAssist AI Chatbot</h2>

            {/* Scrollable Conversation Area */}
            <div
                className='flex-grow justify-around overflow-y-auto mt-4 px-4 pb-16 mx-12' // Added padding to leave space for the microphone
                ref={conversationRef}

            >
                {audioUrl.length > 0 && audioUrl.map((audio, index) => (
                    <div key={index}>
                        {/* Display sender name */}
                        <div className={`text-white ${index % 2 === 0 ? 'text-left text-emerald-400' : 'text-right text-emerald-500'} mb-1`}>
                            {index % 2 === 0 ? "You" : "Rachel"}
                        </div>

                        {/* Display audio bubble */}
                        <div className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} p-1`}>
                            <audio src={audio} controls className="w-80 rounded-lg shadow-lg" />
                        </div>
                    </div>
                ))}

            </div>

            {/* Floating Microphone and Cancel Buttons at the Bottom */}
            <div className='fixed bottom-0 left-0 right-0 flex flex-col items-center space-y-4 ' >
                <button
                    className={`bg-blue-600 p-4 rounded-full shadow-lg transition duration-300 ${isRecording ? 'hover:bg-red-600' : 'hover:bg-blue-800'}`}
                    onClick={isRecording ? stopAudioRecording : startAudioRecording}
                >
                    <FaMicrophone className='text-white text-3xl' />
                </button>
                <span className='text-white'>{isRecording ? 'Recording...' : 'Click to start recording'}</span>

                {/* Cancel Button */}
                <button
                    className='bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300'
                    onClick={cancelRecording}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default ChatBot