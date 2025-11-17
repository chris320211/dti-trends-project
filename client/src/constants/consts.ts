// Types for notes and questions
export interface Question {
    id: string;
    question: string;
    completed: boolean;
}

export interface Note {
    id: string;
    title: string;
    dateAdded: string;
    notes: string;
    questions: Question[];
}

// Dummy data - 3 notes with 5 questions each
// TODO: Replace with MongoDB data when backend is implemented
export const dummyNotes: Note[] = [
    {
        id: '1',
        title: 'testnote1',
        dateAdded: '2024-01-15',
        notes: 'testnotestext1',
        questions: [
            {
                id: '1-1',
                question: 'testquestion1',
                completed: false
            },
            {
                id: '1-2',
                question: 'testquestion2',
                completed: false
            },
            {
                id: '1-3',
                question: 'testquestion3',
                completed: true
            },
            {
                id: '1-4',
                question: 'testquestion4',
                completed: false
            },
            {
                id: '1-5',
                question: 'testquestion5',
                completed: false
            }
        ]
    },
    {
        id: '2',
        title: 'testnote2',
        dateAdded: '2024-01-20',
        notes: 'testnotestext2',
        questions: [
            {
                id: '2-1',
                question: 'testquestion6',
                completed: true
            },
            {
                id: '2-2',
                question: 'testquestion7',
                completed: false
            },
            {
                id: '2-3',
                question: 'testquestion8',
                completed: false
            },
            {
                id: '2-4',
                question: 'testquestion9',
                completed: true
            },
            {
                id: '2-5',
                question: 'testquestion10',
                completed: false
            }
        ]
    },
    {
        id: '3',
        title: 'testnote3',
        dateAdded: '2024-01-25',
        notes: 'testnotestext3',
        questions: [
            {
                id: '3-1',
                question: 'testquestion11',
                completed: false
            },
            {
                id: '3-2',
                question: 'testquestion12',
                completed: false
            },
            {
                id: '3-3',
                question: 'testquestion13',
                completed: true
            },
            {
                id: '3-4',
                question: 'testquestion14',
                completed: false
            },
            {
                id: '3-5',
                question: 'testquestion15',
                completed: false
            }
        ]
    }
];

