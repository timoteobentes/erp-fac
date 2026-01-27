import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccessGroup } from '../GrupoAcesso/grupoAcesso.entity';

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => AccessGroup, (accessGroup) => accessGroup.users)
  @JoinColumn({ name: 'access_group_id' })
  accessGroup: AccessGroup;

  @Column({ name: 'access_group_id', nullable: true })
  accessGroupId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
