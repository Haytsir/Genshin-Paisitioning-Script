# Genshin-Paisitioning-App

원신 게임의 미니맵을 실시간으로 캡처하여 브라우저 상의 지도에 표시하는 프로젝트입니다.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W2UWJ60)

## 프로젝트 소개

**Genshin-Paisitioning 프로젝트는**
**실시간으로 원신 화면을 캡쳐해 미니맵을 이미지 인식해서**
**현재 위치를 게임닷 맵스 사이트 화면에 띄워주는 프로그램/스크립트입니다.**

이 프로젝트는 크게 두 가지로 구성됩니다:

1. **Genshin Paisitioning App** (줄여서 GPA)
2. **Genshin Paisitioning Script** (줄여서 GPS)

## [Genshin Paisitioning App](https://github.com/Haytsir/Genshin-Paisitioning-App) (GPA)

원신 게임 화면을 캡쳐하고 위치 정보를 웹 페이지로 전송하기 위한 런타임 프로그램입니다.

## Genshin Paisitioning Script (GPS)

브라우저에서 GPA와 통신하고, 전달받은 인게임 위치를 맵스 화면에 찍어주기 위한 유저스크립트입니다.

### 🚀 설치 방법

1. **TemperMonkey 또는 GreaseMonkey를 설치** (Beta 버전 유무 상관없으나, 잘 아는게 아니라면 Stable 추천)
2. **확장 프로그램 관리 페이지**(chrome://extensions/) 에서 개발자 모드 활성화

   - 이걸 활성화하지 않으면 모든 userscript가 동작하지 않음 [세부 가이드](https://developer.chrome.com/docs/extensions/reference/api/userScripts?hl=ko#developer_mode_for_extension_users), [적용 근거](https://www.tampermonkey.net/faq.php#Q209)
3. **TemperMonkey 대시보드** 클릭

   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/01.png)
4. **도구 탭** 클릭

   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/02.png)
5. 다음 링크 복사:

   ```
   https://github.com/Haytsir/Genshin-Paisitioning-Script/raw/gh-pages/userscript/genshin-paisitioning-script.user.js
   ```
6. 복사한 스크립트를 붙여넣고 **[설치]** 클릭

   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/03.png)
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/04.png)

### 🗑️ 삭제 방법

1. TemperMonkey 또는 GreaseMonkey [대시보드] 클릭
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/01.png)

2. 원신-파이지셔닝 스크립트 항목의 쓰레기통 아이콘 클릭
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/05.png)
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/06.png)

3. [삭제] 클릭
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/07.png)


## 사용 방법

1. **게임 내 설정 변경**

   - 게임 내 [설정] - [기타] - [미니맵 고정: 방향 고정]으로 설정
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/08.png)

2. **게임닷 맵스 열기**

   - [게임닷 맵스](https://genshin.gamedot.org/?mid=genshinmaps) 열면 실시간 연결 버튼이 생김
   ![](https://raw.githubusercontent.com/Haytsir/Genshin-Paisitioning-Script/refs/heads/master/docs/images/09.png)

3. **실시간 연결**

   - 이 버튼을 누르면 GPA를 실행하고, GPS가 GPA를 준비된 상태로 만들기 위해 업데이트 버전 등등을 점검하고 GPA에게 원신 화면을 인식 시작하라는 명령을 보냅니다.

**다시 말해서, GPA(genshin-paisitioning.exe)는 단독 실행 할 수 없고,**
**GPS(브라우저 측)로부터 실행 요청이 정상적으로 이루어져야 실행 가능합니다.**

## 동작 구조

```
cvAutoTrack ==라이브러리로 호출됨=> GPA <= WebSocket으로 상호 통신 => GPS <= UI로 상호 작용 => 브라우저
```

## QnA

1. 획득한 상자같은 것들도 자동으로 감지되나요?

- 아니요

2. 안전한가요? 정지 위험은?

- 이 프로젝트는 비공식 프로젝트로 사용함에 있어서의 책임은 사용자에게 있습니다.

3. GPA는 어떻게 끄나요?
- GPA는 GPS와 연결된 상태였다면, GPS와 연결이 끊기는 경우(브라우저 탭을 닫는 등) 자동으로 종료됩니다. 하지만 연결이 안된 상태에서 직접 종료하려면 시스템 트레이에서 종료할 수 있습니다.

4. 작동이 안되는 것 같아요! (GPA-GPS 연결 자체가 안될 경우)

- GPA를 수동으로 종료한 뒤, 게임닷 맵스를 새로고침하고 다시 [실시간 연결]을 시도해보세요
  수 차례 해도 똑같은 상황이라면 깃허브 Issue 등록시 자세한 상황을 말해주면 검토해보겠습니다. 또는 자바 스크립트 또는 브라우저 콘솔을 다룰 줄 아는 사람이라면 [실시간 연결] 버튼을 우측 마우스 클릭하면 GPS가 debug 모드로 진입하니 문제 내용과 함께 WebSocket 통신 과정에서 받은 Object  내용을 펼쳐 보여준다면 더 도움이 됩니다.

5. 위치를 얻는 도중 오류가 발생했다고 계속 떠요

- GPA-GPS 서로 연결은 됐지만
  GPA가 사용하는 cvAutoTrack이 원신 화면을 캡쳐하지 못했거나, 원신 화면은 캡쳐했는데 미니맵을 읽지 못했거나, 미니맵에서 위치, 방향 등을 찾아내지 못한 경우입니다. 사용자에 따라서 여러 원인이 있을 수 있는데, 주된 이유는 Nvidia 또는 Amd 그래픽 필터 또는 외부 그래픽 옵션 사용, 프레임/리소스 출력 프로그램이 미니맵이나 페이몬(메뉴) 아이콘을 가림, 미니맵이 방향 고정돼있지 않음 등이 대표적인 원인입니다.

6. genshin_paisitioning_app.exe 실행시 설치 완료 다이얼로그가 나타나지 않았다면
   -\[시작\] - \[cmd 검색\] - \[관리자 권한으로 실행\] `%localappdata%\genshin-paisitioning\genshin_paisitioning_app.exe --install` 복사 후 붙여넣어서 다이얼로그가 나타나는지 확인해보세요
7. 처음 위치는 잡는데 그 뒤로 마커가 움직이질 않아요

- 원신 게임 실행 파일(.exe)를 찾은 뒤, 실행 파일을 우클릭하여 \[속성\] - \[호환성\] - \[전체 화면 최적화 해제\] 체크 - \[적용\]
- NVIDIA 또는 AMD 소프트웨어에서 설정할 수도 있습니다.

8. 작동은 되는데 화살표 마커가 뚝뚝 끊겨 움직이고 막 날아다녀요

- 게임 화면을 캡쳐해서 캡쳐된 이미지를 토대로 위치를 특정하는 방식이기 때문에 브라우저에 표시된 위치가 실제 게임 위치와 다르거나 인식을 잘 못하는 지역에 있다면 순간이동처럼 막 이상한 데 찍는 경우가 있습니다. 이는 왠만해선 컴퓨터의 리소스가 부족하거나 하는 문제가 아닙니다.

## 테스트 환경

- ✅ **Chrome**: 의도한 방식으로 작동함
- ❓ **Firefox, Edge, Safari**: 해당 환경에서 테스트하지 않음, 동작은 할 것이지만 처리되지 못한 버그 발생 가능

## 최근 변경점

### 24-12-25

- **📜 GPS v1.7.3**: 위치 감지를 못하고 있는 상황에 0, 0 좌표로 이동하던 문제 수정

<details><summary>이전 버전 변경점</summary>

### 24-12-21

📜GPS v1.7.2

- 설정을 변경했을 때 GPA에 반영되지 않는 문제 해결
- 내부 Store 및 state subscribe 동작 방식 일부 변경
- GPA 1.2.0에서만 동작함

### 24-12-10

📜GPS v1.7.1

- 위치 마커의 커서 호버링 처리 과정을 복원, 기존 방식대로 동작하도록 처리함
- 위치 마커 시인성 표시가 페이지 시작 때 설정을 무시하고 기본 설정대로 나타나던 오류 수정
- GPA와 연결이 끊겨도 메뉴 버튼이 초기화되지 않던 오류 수정, 이제 페이지를 새로고침 하지 않아도 다시 연결할 수 있음
- 기타 자잘한 오류 수정 및 동작 방식 개선

### 24-12-03

📜GPS v1.7.0

- 추후 개발 용이성 및 확장 편의성 증가를 위해 대부분의 내부 로직 변경
- 설정 모달 창, 다이얼로그 디자인 변경, 토스트 컴포넌트 추가, 업데이트는 다이얼로그로, 오류는 토스트 컴포넌트로만 출력함
- 위치 마커의 인디케이터(퍼짐 효과) 변경 및 커스터마이징 설정 추가.
- 이외에 실 사용시의 큰 변경점은 없음.

### 24-11-25

📜GPS v1.6.10

- GPA 업데이트의 변경점에 맞추기 위해 키 네임의 스타일링을 변경,
- 기능 상 달라진 점은 없으나, 적용하지 않으면 사용 중 버그가 생길 가능성 높음

### 24-09-01

📜GPS v1.6.9

- 현재 위치 포인터가 표시되지 않는 문제 수정

### 23-04-25

📜GPS v1.6.6

- 다이얼로그 최소화 기능 추가

📜GPS v1.6.7

- 여러 화면 크기 지원

📜GPS v1.6.8

- 마이너 픽?스

### 23-04-24

📜GPS v1.6.5

라이브러리 업데이트 도중 다운로드 상황을 표시하는 다이얼로그가 표시되지 않는 문제 수정.
플레이어가 다른 맵(연하궁/층암거연)에 있을때 위치가 표시되지않는 문제 수정

📜GPS v1.6.4

라이브러리 및 GPA 업데이트 중 다이얼로그에 발생하는 문제 수정.

📜GPS v1.6.3

릴리즈

</details>

## 알려진 문제점

## 기여하기

GPS 또는 GPA 기능 제안, 코드 수정(Pull Request), 문제(Issue) 등을 내는 것은 언제나 환영입니다.
Pull Request나 Issue 작성은 각각 GPS/GPA 깃허브에 해주시기 바랍니다.

## 라이선스

이 프로젝트는 오픈소스로 제공되며, 자세한 라이선스 정보는 각 저장소를 참조하시기 바랍니다.
