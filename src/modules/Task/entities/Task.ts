import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tasks')
class Task {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('integer')
    type: number;

    @Column()
    created_user: string;

    @Column()
    enterprise: string;

    @Column()
    executing_task: string;

    @Column('integer')
    status_task: number;

    @Column("time with time zone")
    start_date: Date;

    @Column('time with time zone')
    end_date: Date;

    @Column('boolean')
    repeat: boolean;

    @Column()
    days_of_the_week: string;

    @Column('boolean')
    finished: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default Task;