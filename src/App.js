// import VideoComponent from './video/VideoComponent';
// import Example1Component from './video/Example1Component'
// import BodyFixComponent from './bodyfix/BodyFixComponent';
import MediaPipeComponent from './mediapipe/MediaPipeComponent';
import MediaPipeMultiComponent from './mediapipe/MediaPipeMultiComponent';
import Routers from './router/Routers';
import { Switch } from 'react-router-dom';
import React from 'react';
import TensorFlowComponent from './tensorflow/TensorFlowComponent';

class App extends React.Component {




  render(){
    return (
      <>

      {/* TensorFlow ProtoType */}
      {/* <TensorFlowComponent></TensorFlowComponent> */}

      {/* MediaPipe ProtoType */}
      <MediaPipeComponent></MediaPipeComponent>

      {/* MediaPipe Multi ProtoType */}
      {/* <MediaPipeMultiComponent></MediaPipeMultiComponent> */}

      </>
    );
  }
}

export default App;
