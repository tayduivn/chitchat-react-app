export interface IComponentProps {
    location: {
        query: {
            contactId: string;
            userId: string;
            roomId: string;
            username: string;
        }
    },
    params,
    router,
    dispatch,
};