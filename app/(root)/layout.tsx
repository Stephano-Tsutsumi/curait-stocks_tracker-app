import Header from "@/components/Header"

const Layout = ({ children }: { children : React.ReactNode}) => {
  return (
    <main className="min-h-screen text-gray-400">
        <Header />
        <div className="containe py-10">
            { children }
        </div>
    </main>
  )
}

export default Layout