//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['blockHash', 'contractAddress', '_point', '_sponsor'], { unique: true })
export class IsSponsor {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('integer')
    _point!: number;

  @Column('integer')
    _sponsor!: number;

  @Column('boolean')
    value!: boolean;

  @Column('text', { nullable: true })
    proof!: string;
}
