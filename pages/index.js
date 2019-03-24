import { useEffect, useRef } from 'react'
import { Global, css } from '@emotion/core'
import { saveAs } from 'file-saver'
import getUserMedia from 'getusermedia'
import Sentiment from 'sentiment'
import styled from '@emotion/styled'
import domtoimage from 'dom-to-image'

// styled components
const Page = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100vw',
  height: '100vh',
  flexDirection: 'column',
  margin: 0,
  background: 'black',
  backgroundSize: 'cover',
  color: 'white',
  fontFamily: 'Menlo',
  overflow: 'hidden',
  transition: '.5s'
})

const Heading = styled.h1({
  fontWeight: 'normal'
})

const Logo = styled.img({
  width: '200px'
})

const Button = styled.button({
  display: 'inline-block',
  background: 'transparent',
  border: 'solid 2px white',
  color: 'white',
  padding: '5px 10px',
  textTransform: 'uppercase',
  margin: '10px'
})

const PreviewContainer = styled.div({
  textAlign: 'center'
})

const Preview = styled.div({
  width: '80vw',
  margin: '20px 0'
})

function Index() {
  let recordRtc
  let waveSurfer
  let canvasToImage
  let recorder
  let vsr
  let recognizer
  let waver

  const sentiment = new Sentiment()

  // DOM node references
  // TODO: useState not playing nicely with browser APIs
  const page = useRef()
  const recordBtn = useRef()
  const wave = useRef()
  const result = useRef()
  const score = useRef()

  // when component first mounts load and configure browser APIs
  useEffect(() => {
    recordRtc = require('recordrtc')
    waveSurfer = require('wavesurfer.js')
    vsr = require('voice-speech-recognition')

    // initialize wave surfer
    waver = waveSurfer.create({
      container: wave.current,
      waveColor: '#f3fe42',
      progressColor: '#000000',
      barWidth: 10,
      height: 250
    })

    // initialize WebSpeech API library
    recognizer = vsr.voiceSpeechRecognition()
  })

  // user kicks off recording
  function start() {
    getUserMedia(
      {
        video: false,
        audio: true
      },
      (err, stream) => {
        // usermedia not supported or user declined
        if (err) {
          console.log('User media failed')
          console.log(err)
        } else {
          recordBtn.current.innerHTML = 'Recording...'

          // consifgure usermedia recording library
          recorder = recordRtc(stream, {
            type: 'audio',
            recorderType: recordRtc.StereoAudioRecorder
          })

          // start recording audio and recognizing speech
          recorder.startRecording()
          recognizer.startRecognition()

          // when speech recognition is complete
          // pipe through sentiment analysis and print to screen
          recognizer.addEventListener('end', () => {
            const sentimentAnalysis = sentiment.analyze(
              recognizer.finalRecognizing
            )
            result.current.innerHTML = recognizer.finalRecognizing
            score.current.innerHTML = `Sentiment Score: ${
              sentimentAnalysis.score
            }`
            console.log(sentiment.analyze(recognizer.finalRecognizing))

            if (sentimentAnalysis.score < 0) {
              page.current.style.backgroundImage = 'url(/static/negative.svg)'
              page.current.style.backgroundColor = '#e70005'
            } else if (sentimentAnalysis.score > 0) {
              page.current.style.backgroundImage = 'none'
              page.current.style.backgroundColor = '#e400ff'
            } else {
              page.current.style.backgroundImage = 'none'
              page.current.style.backgroundColor = '#6c6c6c'
            }
          })
        }
      }
    )
  }

  // user stops recording
  function stop() {
    recorder.stopRecording(blob => {
      // stop speech recognition
      recognizer.stopRecognition()
      recordBtn.current.innerHTML = 'Record'

      // print waveform
      recorder.getDataURL(data => {
        drawWaveForm(data)
      })
    })
  }

  // play back recorded audio
  function play() {
    waver.play()
  }

  // download waveform as png
  function download() {
    domtoimage.toBlob(page.current).then(function(blob) {
      saveAs(blob, 'sonicgram.png')
    })
  }

  // clear waveform and start again
  function drawWaveForm(data) {
    waver.empty()
    waver.load(data)
  }

  return (
    <Page ref={page}>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }
        `}
      />
      <Heading>
        <Logo src="/static/sonicgram.svg" />
      </Heading>
      <div>
        <Button ref={recordBtn} onClick={start}>
          Record
        </Button>
        <Button onClick={stop}>Stop</Button>
        <Button onClick={play}>Play</Button>
        <Button onClick={download}>Download</Button>
      </div>
      <PreviewContainer>
        <Preview ref={wave} />
        <p ref={result} />
        <p ref={score} />
      </PreviewContainer>
    </Page>
  )
}

export default Index
