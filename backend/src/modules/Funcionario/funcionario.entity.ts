import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 14, unique: true })
  cpf: string;

  @Column({ length: 20, nullable: true })
  rg: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary: number;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ length: 10, nullable: true })
  zipCode: string;

  @Column({ length: 200, nullable: true })
  street: string;

  @Column({ length: 20, nullable: true })
  number: string;

  @Column({ length: 100, nullable: true })
  complement: string;

  @Column({ length: 100, nullable: true })
  neighborhood: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 2, nullable: true })
  state: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
