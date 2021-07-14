import React, { Suspense , lazy } from "react";
import { Route,  Switch , Redirect, withRouter } from "react-router-dom";


import TensorFlowComponent from '../tensorflow/TensorFlowComponent';
import MediaPipeComponent from '../mediapipe/MediaPipeComponent';
import MediaPipeMultiComponent from '../mediapipe/MediaPipeMultiComponent';

/**
 * 화면 접근을 위한 Router 설정
 * @auther jonghoon_lee
 * @since 2020.11.24
 * @add [2020.11.30] 페이지 별 분기 처리 추가
 */
export const Routers = withRouter(() => {

  return (
    
      <>
      <Suspense fallback={<div></div>}>
        <Switch>
            {/* 로그인 관련 URL */}
            <Route path={"/tensorflow"} render={(props) =><TensorFlowComponent {...props}  />}  />     
            <Route path={"/mediaPipe"} render={(props) =><MediaPipeComponent {...props}  />}  />
            <Route path={"/cmediaPipeMulti"} render={(props) =><MediaPipeMultiComponent {...props}  />}  />
        </Switch>
      </Suspense>
    </>
    

  );
});

export default Routers;