/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";
import persion from '../images/persion.png'


/**
 * 이미지나 webcam을 통해서 얼굴을 인식하고 신체 분절화를 진행한다.
 * @param {*} props 
 */
export const VidioComponent = (props) => {

    const webcamReference = useRef(null);
    const canvasReference = useRef(null);
    const image = document.getElementById('image');

    useEffect(() => {
        loadAndUseBodyPix();
    }, []);

    /**
     * [기능] 최초 모델 로드 
     */
    const loadAndUseBodyPix = async () => {
        //모델을 초기화하는 라는 함수를 만들 것 


        const outputStride = 16;
        const segmentationThreshold = 0.5;
        
        const imageElement = document.getElementById('image');
        
        // load the person segmentation model from a checkpoint
        const net = await bodyPix.load();
        
        // const segmentation = await net.estimatePartSegmentation(imageElement, outputStride, segmentationThreshold);
        const segmentation = await net.segmentPersonParts(imageElement, outputStride, segmentationThreshold)
        console.log(segmentation);
        // const maskBackground = false;
        // const maskImage = bodyPix.toMaskImageData(segmentation, maskBackground);
        
        // const personSegmentation = await net.estimatePersonSegmentation(imageElement);


        // const network = await bodyPix.load({});

        // await test(network);

        // const network = await bodyPix.load({
        //     /** optional arguments, see below **/
        //     architecture: 'MobileNetV1',
        //     outputStride: 16,   //8,16  值越小，输出分辨率越大，模型越精确，速度越慢
        //     multiplier: 0.75,   // 0.5,0.75,1  值越大，层越大，模型越精确，速度越慢
        //     quantBytes: 2
        // });
        // setInterval(async () => {
            await detectBodySegments(net)
        // }, 1000);
    };

    const test = async (network) => {
        // 신체 분절화 이후 좌표 도출
        const segmentation = await network.segmentPersonParts(image);
        console.log(segmentation);
        // await drawBokehEffect(image, segmentation);
    }

    /**
     * 웹캠 및 비디오 스트림 수신 확인 && 신체 분절화 
     * @param {*} network 
     */
    const detectBodySegments = async (network) => {

        // 웹캠이 실행 중이고 비디오 데이터 스트림을 수신하는지 확인해야합니다.
        if (!(webcamReference.current === "undefined") && !(webcamReference.current == null) && !(webcamReference.current.video.readyState === 4)) {
            console.log("장치 미 수신");
        } else {
            console.log("장치 수신 완료");
            // 이전에 정의한을 사용하여 크기와 함께 비디오 속성을 가져와야합니다 .
            const video = webcamReference.current.video;
            const videoWidth = webcamReference.current.video.videoWidth;
            const videoHeight = webcamReference.current.video.videoHeight;

            // 우리는의 크기를 설정할 필요가 Webcam아니라 같이 canvas다음 코드의 코드를 사용하여, 비디오 스트림의 높이 및 폭에 기초하여 동일하게
            webcamReference.current.video.width = videoWidth;
            webcamReference.current.video.height = videoHeight;
            canvasReference.current.width = videoWidth;
            canvasReference.current.height = videoHeight;

            // [기능] 신체 분절화 이후 좌표 도출
            const bodySegmentation = await network.segmentPersonParts(video, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7,
                maxDetections: 10,
                scoreThreshold: 0.2,
                nmsRadius: 20,
                minKeypointScore: 0.3,
                refineSteps: 10
            });

            // [기능] 신체 분절화 및 신체 별 마스크 적용
            // await toColoredPartMask(video, body);


            // [기능] 여러사람들에 대한 분절화 이후 좌표 도출
            // const bodySegmentation = await network.segmentMultiPerson(video, {
            //     flipHorizontal: false,
            //     internalResolution: 'medium',
            //     segmentationThreshold: 0.7,
            //     maxDetections: 10,
            //     scoreThreshold: 0.2,
            //     nmsRadius: 20,
            //     minKeypointScore: 0.3,
            //     refineSteps: 10
            // });

            // [기능] 뒤에 배경 블로 처리 
            await drawBokehEffect(video, bodySegmentation);


            // toColoredPartMask(video, bodySegmentation);

            // 

        }
    }

    /**
     * bodyPix.drawBokehEffect
     * 뒷배경 블로 처리 
     * @param {*} video 
     * @param {*} segmentation 
     */
    const drawBokehEffect = async (video, segmentation) => {
        const backgroundBlurAmount = 20;
        const edgeBlurAmount = 20;
        const flipHorizontal = false;
        const canvas = canvasReference.current;

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
     * 마스크 컬러 적용
     * @param {*} body 
     */
    const toColoredPartMask = async (video, segmentation) => {
        // 캔버스에 컬러 마스크 그리기
        const coloredBodyParts = bodyPix.toColoredPartMask(segmentation);
        const opacityValue = 0.7;
        const flipHorizontal = false;
        const maskBlurDensity = 0;
        const canvas = canvasReference.current;
        bodyPix.drawMask(
            canvas,
            video,
            coloredBodyParts,
            opacityValue,
            maskBlurDensity,
            flipHorizontal
        );
    }



    return (
        <>
            <body>
                <div className="App">
                    **<Webcam
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
                <div>
                    <img id='image' src={persion} crossOrigin='anonymous' />
                </div>

            </body>
        </>
    )

}
export default VidioComponent