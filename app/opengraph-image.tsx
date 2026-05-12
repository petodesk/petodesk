import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#f3f4f6',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        {/* MAIN CARD */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            padding: '56px 64px',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          {/* LEFT SIDE */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '60%',
            }}
          >
            {/* LOGO */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <img
                src="https://petodesk.com/logo.svg"
                width="44"
                height="44"
                alt="PetoDesk"
              />

              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#2563eb',
                  marginLeft: '16px',
                }}
              >
                PetoDesk
              </div>
            </div>

            {/* TITLE */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.1,
              }}
            >
              <div
                style={{
                  fontSize: '54px',
                  fontWeight: 800,
                  color: '#2563eb',
                }}
              >
                Manage Your Business and Team
              </div>

              <div
                style={{
                  fontSize: '54px',
                  fontWeight: 800,
                  color: '#111827',
                  marginTop: '8px',
                }}
              >
                Smarter All in One Platform
              </div>
            </div>

            {/* DESCRIPTION */}
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1.6,
                color: '#4b5563',
                marginTop: '32px',
                maxWidth: '90%',
              }}
            >
              Track your sales effortlessly, manage inventory in real time,
              oversee your staff and their tasks, run payroll with ease,
              handle HR operations seamlessly, and make smarter business
              decisions all from one secure platform.
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              display: 'flex',
              width: '35%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src="https://petodesk.com/on-phone-1.png"
              width="390"
              height="520"
              alt="Phone Preview"
              style={{
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>
    ),
    size
  )
}