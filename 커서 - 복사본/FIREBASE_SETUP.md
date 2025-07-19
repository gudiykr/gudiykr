# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름을 "guidy"로 설정
4. Google Analytics 설정 (선택사항)
5. "프로젝트 만들기" 클릭

## 2. 웹 앱 추가

1. 프로젝트 대시보드에서 웹 아이콘(</>) 클릭
2. 앱 닉네임을 "guidy-web"으로 설정
3. "앱 등록" 클릭
4. Firebase SDK 설정 정보 복사

## 3. Firestore 데이터베이스 설정

1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "테스트 모드에서 시작" 선택
4. 위치 선택 (가까운 지역 선택)

## 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Firebase SDK 설정 정보에서 각 값을 복사하여 입력하세요.

## 5. Firestore 보안 규칙 설정

Firestore Database > 규칙 탭에서 다음 규칙을 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 컬렉션
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 가이드 컬렉션
    match /guides/{guideId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 시간대 컬렉션
    match /timeSlots/{timeSlotId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 예약 컬렉션
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
    
    // 알림 컬렉션
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. 인증 설정 (선택사항)

1. Authentication > Sign-in method
2. 이메일/비밀번호 활성화
3. Google 로그인 활성화 (선택사항)

## 7. 개발 서버 실행

```bash
npm run dev
```

## 8. 테스트 데이터 생성

시스템이 처음 실행될 때 기본 가이드 데이터가 자동으로 생성됩니다.

## 주의사항

- 실제 운영 환경에서는 보안 규칙을 더 엄격하게 설정해야 합니다
- 프로덕션 배포 시 환경 변수를 안전하게 관리하세요
- Firebase 사용량과 비용을 모니터링하세요 