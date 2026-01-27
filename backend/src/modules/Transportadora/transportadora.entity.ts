import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transportadora')
export class Carrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, nullable: true })
  tradeName: string;

  @Column({ length: 18, unique: true })
  document: string; // CPF ou CNPJ

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  contactPerson: string;

  @Column({ length: 20, nullable: true })
  vehiclePlate: string;

  @Column({ length: 50, nullable: true })
  vehicleType: string;

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
