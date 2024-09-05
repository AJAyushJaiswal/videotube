import mongoose from 'mongoose';


const runAsTransaction = async (fn) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try{
        const result = await fn(session);
        await session.commitTransaction();
        return result;
    }
    catch(error){
        session.abortTransaction();
        console.error('Tranaction failed!');
        throw error;
    }
    finally{
        session.endSession();
    }
}


export {runAsTransaction}