export default function PendingApprovalPage() {
  return (
    <main className="min-h-screen bg-[#fff7ec] px-4 py-8">
      <section className="mx-auto max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <img
          src="/guruji-logo.jpg"
          alt="Guruji"
          className="mx-auto h-24 w-24 rounded-full border-4 border-[#ffd166] object-cover"
        />

        <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-[#d94a12]">
          Jai Guru Ji
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#35170c]">
          Approval Pending
        </h1>

        <p className="mt-4 text-sm leading-6 text-gray-600">
          Your profile has been submitted. Admin approval is required before you
          can access the app.
        </p>
      </section>
    </main>
  );
}
