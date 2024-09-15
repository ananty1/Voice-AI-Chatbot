var audioRecorder = {
    // start the recording, returns a promise if an audio recording is successfully started

    audioBlobs:[],
    mediaRecorder:null,
    streamBeingCaptured:null,

    start: function (){
        // Feature detection

        if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){
            return Promise.reject(new Error('mediaDevices API or getUserMedia method  is not supported in the browser.'))
        }
        else{
            // Feature   is supported by browser

            return navigator.mediaDevices.getUserMedia({audio:true})
                .then(stream =>{
                    audioRecorder.streamBeingCaptured = stream;

                    audioRecorder.mediaRecorder = new MediaRecorder(stream);
                    
                    audioRecorder.audioBlobs = []

                    audioRecorder.mediaRecorder.addEventListener('dataavailable',event =>{
                        audioRecorder.audioBlobs.push(event.data);
                    })

                    audioRecorder.mediaRecorder.start();


                })
            


        }
    },

    // stop the recording,  returns a promise that resolves to the audio as blob file
    stop: function (){

        return new Promise(resolve =>{

            // save the audio type to pass  to set the blob type
            let mimeType = audioRecorder.mediaRecorder.mimeType;

            audioRecorder.mediaRecorder.addEventListener("stop",()=>{

                // create a single audio object as there can be multiple blobs 
                let audioBlob = new Blob(audioRecorder.audioBlobs,{type:mimeType});


                // resolve promise with the single audio blob representing the recorded audio 
                resolve(audioBlob);
            });

            audioRecorder.cancel()
           
        });

    },
    stopStream: function(){
        // stopping the captured request by stopping all the tracks on the active stream

        audioRecorder.streamBeingCaptured.getTracks()
            .forEach(track => track.stop());
    },

    resetRecordingProperties: function(){
        audioRecorder.mediaRecorder = null;
        audioRecorder.streamBeingCaptured = null;


    },

    // cancel the audio recording
    cancel: function(){

        audioRecorder.mediaRecorder.stop();

        audioRecorder.stopStream();

        audioRecorder.resetRecordingProperties();

    }

}

export default audioRecorder;