import { PancakeSwapHeader } from '@pancakeswap/widgets'

const AnnouncementBanner = () => {
  return (
    <PancakeSwapHeader.AnnouncementBanner>
      <div style={{ backgroundColor: 'var(--colors-backgroundAlt)' }}>
        <div
          style={{
            backgroundImage: `url('https://assets.pancakeswap.finance/web/banners/competition.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '75px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 20px' }}>
            <h2>Announcement Banner</h2>
            <p style={{ marginLeft: '20px' }}>
              This is a placeholder for an announcement banner. You can customize it with your own content.
            </p>
          </div>
        </div>
      </div>
    </PancakeSwapHeader.AnnouncementBanner>
  )
}

const Home = () => {
  return (
    <>
      <PancakeSwapHeader announcementBanner={<AnnouncementBanner />}>
        <div style={{ padding: '20px', textAlign: 'center', height: '130vh' }}>
          <div>Welcome to PancakeSwap Widgets Playground</div>
          <div>Explore our widgets and customize your experience!</div>
        </div>
      </PancakeSwapHeader>
    </>
  )
}

export default Home

Home.pure = true
