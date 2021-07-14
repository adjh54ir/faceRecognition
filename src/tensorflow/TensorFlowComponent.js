
import React, { useRef, useEffect, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";

import '../css/style.css'

/**
 * webCam
 * @param {*} props 
 */
export const TensorFlowComponent = () => {

    const webcamReference = useRef(null);
    const canvasReference = useRef(document.getElementById('canvas'));
    const [network, setNetwork] = useState(null);

    const [ divice, setDivice ] = useState({ video: null, canvas: null});


    useEffect(() => {
        _fn_loadAndPredict();   // [기능] 초기 bodypix를 로드해옴
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * [기능] 최초 'bodyPix' 모델 설정 && 비디오 세팅
     * 
     * ######## bodyPix.load Option ########
     // #### [option1] - ResNet (더 크고 느리고 더 정확함) ** new! **
     // architecture: 'ResNet50',
     // outputStride: 32,
     // quantBytes: 2

     // #### [option2] - ResNet (더 크고 느리고 더 정확함)
     // architecture: 'MobileNetV1',
     // outputStride: 16,
     // multiplier: 0.75,
     // quantBytes: 2
     */
    const _fn_loadAndPredict = async () => {
        
        await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        })
        .then((net) =>{
            setNetwork(net);
        });
        await _fn_vidioSetting();
    }

    /**
     * [기능] 사람 세분화 정보를 가져온다 => 각각에 따른 좌표들을 가져옴
     * 한 명 이상의 사람이있는 이미지가 주어지면 사람 세분화는 모든 사람의 세분화를 함께 예측 합니다. 
     * [option]
     *   - net.segmentPerson
     *   - net.segmentPersonParts
     *   - net.segmentMultiPerson
     *   - net.segmentMultiPersonParts
     */
    const _fn_segmentPerson = async () => {


        // 웹 캠 정보를 가져온다
        const video = webcamReference.current.video;
        const segmentation = await network.segmentPerson(video, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: 0.7
        });
        
        await _fn_drawBokehEffect(segmentation);

        // 브라우져에게 수행하기를 원하는 애니메이션을 알리고 다음 리페인트가 진행되기전에 해당 에니메이션을 업데이트하는 함수 
        requestAnimationFrame(_fn_segmentPerson);
    }


    /**
     * [기능] 신체를 부분적으로 나눠서 처리 
     */
    const _fn_toColoredPartMask = async() =>{
        
        // 웹 캠 정보를 가져온다
        const video = webcamReference.current.video;
        const segmentation = await network.segmentMultiPersonParts(video, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: 0.7,
            maxDetections: 10,
            scoreThreshold: 0.2,
            nmsRadius: 20,
            minKeypointScore: 0.3,
            refineSteps: 10
          });
        // The mask image is an binary mask image with a 1 where there is a person and
        // a 0 where there is not.
        const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
        const opacity = 0.7;
        const flipHorizontal = false;
        const maskBlurAmount = 0;
        // Draw the mask image on top of the original image onto a canvas.
        // The colored part image will be drawn semi-transparent, with an opacity of
        // 0.7, allowing for the original image to be visible under.
        bodyPix.drawMask(
            divice.canvas, divice.video, coloredPartImage, opacity, maskBlurAmount,
            flipHorizontal);

        requestAnimationFrame(_fn_toColoredPartMask);
    }
    /**
     * [기능] 배경 흐리게 처리하는 기능
     * 
     */
    const _fn_drawBokehEffect = async (segmentation) => {
        
        const backgroundBlurAmount = 20;     // 배경 에서 서로 혼합되는 픽셀 수입니다. 기본값은 3입니다. 1에서 20 사이의 정수 여야합니다.
        const edgeBlurAmount = 20;           // 사람과 배경 사이의 가장자리에서 블러 할 픽셀 수입니다. 기본값은 3입니다. 0에서 20 사이의 정수 여야합니다.
        const flipHorizontal = false;       // 출력을 수평으로 뒤집어 야하는 경우. 기본값은 false입니다.

         // 웹 캠 정보를 가져온다
         const canvas = document.getElementById('canvas');

         const video = webcamReference.current.video;
         const videoWidth = webcamReference.current.video.videoWidth;
         const videoHeight = webcamReference.current.video.videoHeight;
 
         // 우리는의 크기를 설정할 필요가 Webcam아니라 같이 canvas다음 코드의 코드를 사용하여, 비디오 스트림의 높이 및 폭에 기초하여 동일하게
         webcamReference.current.video.width = videoWidth;
         webcamReference.current.video.height = videoHeight;
         canvasReference.current.width = videoWidth;
         canvasReference.current.height = videoHeight;

        // Draw the image with the background blurred onto the canvas. The edge between
        // the person and blurred background is blurred by 3 pixels.
        bodyPix.drawBokehEffect(
            canvas, 
            video, 
            segmentation, 
            backgroundBlurAmount, 
            edgeBlurAmount, 
            flipHorizontal
        );
    }


    /**
     * [기능] 웹캠 및 캔버스 종류를 가져옴.
     */
    const _fn_vidioSetting = async ()=>{
        // 웹 캠 정보를 가져온다
        const canvas = document.getElementById('canvas');

        const video = webcamReference.current.video;
        const videoWidth = webcamReference.current.video.videoWidth;
        const videoHeight = webcamReference.current.video.videoHeight;

        // 우리는의 크기를 설정할 필요가 Webcam아니라 같이 canvas다음 코드의 코드를 사용하여, 비디오 스트림의 높이 및 폭에 기초하여 동일하게
        webcamReference.current.video.width = videoWidth;
        webcamReference.current.video.height = videoHeight;
        canvasReference.current.width = videoWidth;
        canvasReference.current.height = videoHeight;
        setDivice({video: video, canvas: canvas});

        console.log(`webcamReference:: ${webcamReference.current.width}`);
        console.log(`canvasReference:: ${canvasReference.current.width}`);
    }


    /**
     * [기능] 새로고침
     */
    const _fn_cancel = async() =>{
        await window.location.reload();
    }


    return (
        <>
            <div className="App">
                <h1>body pix</h1>
                <div>
                    <button onClick={()=> _fn_segmentPerson()}>Blur Effect</button>
                    <button onClick={()=> _fn_toColoredPartMask()}>To Colored Part Mask Effect</button>
                    <button onClick={() => _fn_cancel()}>Blur 취소</button>
                </div>
                <div>
            <Webcam
                ref={webcamReference}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zindex: 9,
                    width: 720,
                    height: 500,
                }}
            />
            <canvas
                id="canvas"
                ref={canvasReference}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zindex: 9,
                    width: 720,
                    height: 500,
                }}
            />
            </div>
        </div>

        </>
    );
    

}
export default TensorFlowComponent;



