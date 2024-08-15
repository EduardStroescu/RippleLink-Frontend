export function ChangePasswordForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-fit px-10 py-6 flex flex-col gap-4 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40"
    >
      <label htmlFor="oldPassword">Old Password</label>
      <input type="text" />
      <label htmlFor="newPassword">New Password</label>
      <input type="text" />
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input type="text" />
      <button className=" bg-cyan-900 hover:bg-cyan-800 text-white py-2 px-4 rounded">
        Change Password
      </button>
    </form>
  );
}
