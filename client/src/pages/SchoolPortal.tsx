

const SchoolPortal = () => {
    return (
        <div className="max-w-7xl mx-auto">
             <div className="mb-8 border-b-2 border-black pb-4">
                <h1 className="text-4xl font-bold text-black mb-2 uppercase tracking-tighter">
                   School Admin Portal
                </h1>
                <p className="text-gray-600 font-medium">
                   Oversee school operations, user management, and reports.
                </p>
            </div>
            <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xl font-bold">Welcome, Admin!</p>
                <p className="mt-4 text-gray-600">Central administration dashboard for your institution.</p>
            </div>
        </div>
    );
};

export default SchoolPortal;
