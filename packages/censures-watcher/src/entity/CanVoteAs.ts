//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['blockHash', 'contractAddress', '_point', '_who'], { unique: true })
export class CanVoteAs {
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

  @Column('varchar', { length: 42 })
    _who!: string;

  @Column('boolean')
    value!: boolean;

  @Column('text', { nullable: true })
    proof!: string;
}
