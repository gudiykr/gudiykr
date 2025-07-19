"use client"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>예상치 못한 오류가 발생했습니다.</h2>
          <p>{error.message}</p>
          <button onClick={() => reset()}>홈으로 돌아가기</button>
        </div>
      </body>
    </html>
  )
} 