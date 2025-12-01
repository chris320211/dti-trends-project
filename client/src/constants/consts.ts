// Types for notes and questions
export interface Question {
    id: string;
    question: string;
    answer: string;
    completed: boolean;
}

export interface Note {
    id: string;
    title: string;
    dateAdded: string;
    notes: string;
    summary: string;
    questions: Question[];
}

export const dummyNotes: Note[] = [
    {
        id: '1',
        title: 'testnote1',
        dateAdded: '2024-01-15',
        notes: 'testnotestext1',
        summary: 'testsummary1',
        questions: [
            {
                id: '1-1',
                question: 'testquestion1',
                answer: 'testanswer1',
                completed: false
            },
            {
                id: '1-2',
                question: 'testquestion2',
                answer: 'testanswer2',
                completed: false
            },
            {
                id: '1-3',
                question: 'testquestion3',
                answer: 'testanswer3',
                completed: true
            },
            {
                id: '1-4',
                question: 'testquestion4',
                answer: 'testanswer4',
                completed: false
            },
            {
                id: '1-5',
                question: 'testquestion5',
                answer: 'testanswer5',
                completed: false
            }
        ]
    },
    {
        id: '2',
        title: 'testnote2',
        dateAdded: '2024-01-20',
        notes: 'testnotestext2',
        summary: 'testsummary2',
        questions: [
            {
                id: '2-1',
                question: 'testquestion6',
                answer: 'testanswer6',
                completed: true
            },
            {
                id: '2-2',
                question: 'testquestion7',
                answer: 'testanswer7',
                completed: false
            },
            {
                id: '2-3',
                question: 'testquestion8',
                answer: 'testanswer8',
                completed: false
            },
            {
                id: '2-4',
                question: 'testquestion9',
                answer: 'testanswer9',
                completed: true
            },
            {
                id: '2-5',
                question: 'testquestion10',
                answer: 'testanswer10',
                completed: false
            }
        ]
    },
    {
        id: '3',
        title: 'testnote3',
        dateAdded: '2024-01-25',
        notes: 'testnotestext3',
        summary: 'testsummary3',
        questions: [
            {
                id: '3-1',
                question: 'testquestion11',
                answer: 'testanswer11',
                completed: false
            },
            {
                id: '3-2',
                question: 'testquestion12',
                answer: 'testanswer12',
                completed: false
            },
            {
                id: '3-3',
                question: 'testquestion13',
                answer: 'testanswer13',
                completed: true
            },
            {
                id: '3-4',
                question: 'testquestion14',
                answer: 'testanswer14',
                completed: false
            },
            {
                id: '3-5',
                question: 'testquestion15',
                answer: 'testanswer15',
                completed: false
            }
        ]
    }
];

